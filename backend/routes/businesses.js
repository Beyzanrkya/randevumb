const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Business = require("../models/Business");
const authMiddleware = require("../middleware/auth");

// GEREKSİNİM 5: İŞLETME ÜYE OLMA
// POST /businesses/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address, description, categoryId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email ve password zorunludur",
      });
    }

    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      return res.status(409).json({
        message: "Bu email adresi zaten kullanılıyor",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newBusiness = new Business({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      description,
      categoryId,
    });

    const savedBusiness = await newBusiness.save();

    res.status(201).json({
      message: "İşletme başarıyla oluşturuldu",
      business: {
        _id: savedBusiness._id,
        name: savedBusiness.name,
        email: savedBusiness.email,
        createdAt: savedBusiness.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// GEREKSİNİM 6: İŞLETME GİRİŞ
// POST /businesses/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email ve şifre zorunludur" });
    }

    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(401).json({ message: "Email veya şifre hatalı" });
    }

    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email veya şifre hatalı" });
    }

    const token = jwt.sign(
      { businessId: business._id, email: business.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Giriş başarılı",
      token,
      business: {
        _id: business._id,
        name: business.name,
        email: business.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// GEREKSİNİM 7: İŞLETME OLUŞTURMA
// POST /businesses
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, email, password, phone, address, description, categoryId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email ve password zorunludur",
      });
    }

    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      return res.status(409).json({
        message: "Bu email adresi zaten kullanılıyor",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newBusiness = new Business({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      description,
      categoryId,
    });

    const savedBusiness = await newBusiness.save();

    res.status(201).json({
      message: "İşletme başarıyla eklendi",
      business: {
        _id: savedBusiness._id,
        name: savedBusiness.name,
        email: savedBusiness.email,
        createdAt: savedBusiness.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

module.exports = router;