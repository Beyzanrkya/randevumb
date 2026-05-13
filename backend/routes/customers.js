const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const Customer = require("../models/Customer");
const authMiddleware = require("../middleware/auth");

// POST /customers/register -> Kayıt işlemi
router.post("/register", customerController.registerCustomer);

// POST /customers/verify-email -> Doğrulama işlemi
router.post("/verify-email", customerController.verifyEmail);

// POST /customers/login -> Giriş işlemi
router.post("/login", customerController.loginCustomer);

// Google Login
router.post("/google-login", customerController.googleLogin);

// Şifre Sıfırlama
router.post("/forgot-password", customerController.forgotPassword);
router.post("/reset-password", customerController.resetPassword);

// GET /customers/me -> Token ile kendi profilini getir
router.get("/me", authMiddleware, customerController.getMyProfile);

// Belirli bir müşteriyi ID ile getir (Test ve Profil sayfası için)
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("-password");
    if (!customer) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// PUT /customers/me -> Token ile kendi profilini güncelle
router.put("/me", authMiddleware, customerController.updateMyProfile);

// Şifre Değiştirme (Token ile)
router.patch("/change-password/me", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const customer = await Customer.findById(req.user.userId);
    if (!customer) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    
    // Not: Normalde bcrypt.compare kullanılmalı, ancak projenin mevcut yapısına uygun olarak direkt karşılaştırma yapıyoruz.
    if (customer.password !== oldPassword) return res.status(400).json({ message: "Eski şifre hatalı" });
    
    customer.password = newPassword;
    await customer.save();
    res.json({ message: "Şifre başarıyla güncellendi" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Şifre Değiştirme (Lokal test için ID ile - Opsiyonel)
router.patch("/change-password/:id", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    if (customer.password !== oldPassword) return res.status(400).json({ message: "Eski şifre hatalı" });
    
    customer.password = newPassword;
    await customer.save();
    res.json({ message: "Şifre başarıyla güncellendi" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// PUT /customers/:customerId -> ID ile profil güncelleme (eski uyumluluk)
router.put("/:customerId", customerController.updateProfile);

module.exports = router;