const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const mailer = require('../utils/mailer');

// Yardımcı fonksiyon: 6 haneli kod üretme
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. GEREKSİNİM: Müşteri Üye Olma
exports.registerCustomer = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Ad, email ve şifre zorunludur" });
        }

        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(409).json({ message: "Bu email zaten kullanılıyor" });
        }

        const verificationCode = generateVerificationCode();
        const newCustomer = new Customer({ name, email, password, verificationCode });
        await newCustomer.save();

        // E-posta gönder (hatayı logla ama kayıt işlemini bozma)
        try {
            await mailer.sendVerificationEmail(email, verificationCode);
        } catch (mailError) {
            console.error("E-posta gönderilemedi:", mailError);
        }

        res.status(201).json({
            message: "Hesap oluşturuldu. Lütfen e-postanıza gelen kodu doğrulayın.",
            customer: { id: newCustomer._id, name: newCustomer.name, email: newCustomer.email }
        });
    } catch (error) {
        res.status(400).json({ message: "Kayıt başarısız", error: error.message });
    }
};

// E-posta Doğrulama İşlemi
exports.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }

        if (customer.verificationCode !== code) {
            return res.status(400).json({ message: "Geçersiz doğrulama kodu" });
        }

        customer.isVerified = true;
        customer.verificationCode = undefined; // Kodu temizle
        await customer.save();

        res.status(200).json({ message: "E-posta başarıyla doğrulandı" });
    } catch (error) {
        res.status(500).json({ message: "Doğrulama hatası", error: error.message });
    }
};

// 2. GEREKSİNİM: Müşteri Giriş
exports.loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email ve şifre zorunludur" });
        }

        const customer = await Customer.findOne({ email });

        if (!customer || customer.password !== password) {
            return res.status(401).json({ message: "Email veya şifre hatalı" });
        }

        if (!customer.isVerified) {
            return res.status(403).json({ 
                message: "Lütfen önce e-postanızı doğrulayın", 
                needsVerification: true,
                email: customer.email 
            });
        }

        const token = jwt.sign(
            { userId: customer._id, email: customer.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Giriş başarılı",
            token: token,
            customerId: customer._id,
            name: customer.name,
            email: customer.email
        });

    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
};

// 3a. GEREKSİNİM: Kendi Profilini Getir (Token ile)
// API Metodu: GET /customers/me
exports.getMyProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.userId).select('-password');
        if (!customer) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
};

// 3b. GEREKSİNİM: Kendi Profilini Güncelle (Token ile)
// API Metodu: PUT /customers/me
exports.updateMyProfile = async (req, res) => {
    try {
        const { name, phone, birthDate, profilePicture } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (birthDate !== undefined) updateData.birthDate = birthDate;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.user.userId,
            updateData,
            { new: true }
        ).select('-password');

        if (!updatedCustomer) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        res.status(200).json({ message: "Profil güncellendi", customer: updatedCustomer });
    } catch (error) {
        res.status(400).json({ message: "Güncelleme hatası", error: error.message });
    }
};

// --- ŞİFRE SIFIRLAMA ---

// 1. Kod Gönder
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(404).json({ message: "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı." });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        customer.verificationCode = resetCode; 
        await customer.save();

        await mailer.sendVerificationEmail(email, resetCode);

        res.status(200).json({ message: "Şifre sıfırlama kodu e-postanıza gönderildi." });
    } catch (error) {
        res.status(500).json({ message: "Hata oluştu", error: error.message });
    }
};

// 2. Şifreyi Güncelle
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        const customer = await Customer.findOne({ email });

        if (!customer || customer.verificationCode !== code) {
            return res.status(400).json({ message: "Geçersiz kod veya e-posta." });
        }

        customer.password = newPassword;
        customer.verificationCode = undefined;
        await customer.save();

        res.status(200).json({ message: "Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz." });
    } catch (error) {
        res.status(500).json({ message: "Şifre güncellenemedi", error: error.message });
    }
};

// 3c. GEREKSİNİM: Profil Güncelleme (ID ile - eski uyumluluk)
// API Metodu: PUT /customers/:customerId
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;

        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.customerId,
            updateData,
            { new: true }
        ).select('-password');

        if (!updatedCustomer) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        res.status(200).json({ message: "Profil güncellendi", customer: updatedCustomer });
    } catch (error) {
        res.status(400).json({ message: "Güncelleme hatası", error: error.message });
    }
};