const Customer = require('../models/Customer'); // Müşteri şemasını çağırıyoruz
const jwt = require('jsonwebtoken'); // JWT paketini dahil ediyoruz

// 1. GEREKSİNİM: Müşteri Üye Olma
// API Metodu: POST /customers/register
exports.registerCustomer = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(409).json({ message: "Bu email zaten kullanılıyor" });
        }
        
        // Yeni bir müşteri nesnesi oluşturuluyor
        const newCustomer = new Customer({ name, email, password });
        
        // Veritabanına kaydediliyor
        await newCustomer.save();
        
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(400).json({ message: "Kayıt başarısız", error: error.message });
    }
};

// 2. GEREKSİNİM: Müşteri Giriş
// API Metodu: POST /customers/login
exports.loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body; 
        
        // Veritabanında bu email var mı kontrol edilir
        const customer = await Customer.findOne({ email });
        
        // Şifre kontrolü (Eğer bcrypt kullanmıyorsan şimdilik düz metin kontrolü)
        if (!customer || customer.password !== password) {
            return res.status(401).json({ message: "Email veya şifre hatalı" });
        }

        // --- GERÇEK JWT TOKEN ÜRETİMİ ---
        
        const token = jwt.sign(
    { userId: customer._id, email: customer.email }, // Token içine kullanıcının ID'sini gömüyoruz
    process.env.JWT_SECRET, // Beyza'nın auth.js'de kullandığı gizli anahtar
    { expiresIn: '24h' } // Token 24 saat geçerli olsun
    );

        res.status(200).json({ 
        message: "Giriş başarılı", 
        token: token 
        });

    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
};

// 3. GEREKSİNİM: Profil Güncelleme
// API Metodu: PUT /customers/{customerId}
exports.updateProfile = async (req, res) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.customerId, 
            req.body, 
            { new: true } 
        );
        
        if (!updatedCustomer) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        
        res.status(200).json(updatedCustomer);
    } catch (error) {
        res.status(400).json({ message: "Güncelleme hatası" });
    }
};