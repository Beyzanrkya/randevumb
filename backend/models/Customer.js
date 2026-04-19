const mongoose = require('mongoose');

// Müşteri Şeması - Tasarımdaki CustomerRegister ve User modellerine uygun
const customerSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Ad Soyad
    email: { type: String, required: true, unique: true }, // Benzersiz email
    password: { type: String, required: true }, // Şifre
    phone: { type: String }, // Telefon numarası (Opsiyonel)
    createdAt: { type: Date, default: Date.now } // Kayıt tarihi 
});

module.exports = mongoose.model('Customer', customerSchema);