const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

// API Tasarımındaki yollar:
// POST /customers/register -> Kayıt işlemi
router.post("/register", customerController.registerCustomer);

// POST /customers/login -> Giriş işlemi
router.post("/login", customerController.loginCustomer);

// PUT /customers/:customerId -> Profil güncelleme
router.put("/:customerId", customerController.updateProfile);

module.exports = router;