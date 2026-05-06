const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middleware/auth");

// POST /customers/register -> Kayıt işlemi
router.post("/register", customerController.registerCustomer);

// POST /customers/verify-email -> Doğrulama işlemi
router.post("/verify-email", customerController.verifyEmail);

// POST /customers/login -> Giriş işlemi
router.post("/login", customerController.loginCustomer);

// Şifre Sıfırlama
router.post("/forgot-password", customerController.forgotPassword);
router.post("/reset-password", customerController.resetPassword);

// GET /customers/me -> Token ile kendi profilini getir
router.get("/me", authMiddleware, customerController.getMyProfile);

// PUT /customers/me -> Token ile kendi profilini güncelle
router.put("/me", authMiddleware, customerController.updateMyProfile);

// PUT /customers/:customerId -> ID ile profil güncelleme (eski uyumluluk)
router.put("/:customerId", authMiddleware, customerController.updateProfile);

module.exports = router;