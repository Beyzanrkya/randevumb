const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

// 1. GEREKSİNİM: Müşteri Üye Olma
// API Metodu: POST /customers/register
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

        const newCustomer = new Customer({ name, email, password });
        await newCustomer.save();

        res.status(201).json({
            message: "Hesap başarıyla oluşturuldu",
            customer: { id: newCustomer._id, name: newCustomer.name, email: newCustomer.email }
        });
    } catch (error) {
        res.status(400).json({ message: "Kayıt başarısız", error: error.message });
    }
};

// 2. GEREKSİNİM: Müşteri Giriş
// API Metodu: POST /customers/login
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