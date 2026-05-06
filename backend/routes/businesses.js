const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Business = require("../models/Business");
const BusinessOwner = require("../models/BusinessOwner");
const authMiddleware = require("../middleware/auth");
const mailer = require("../utils/mailer");

// Yardımcı fonksiyon: 6 haneli kod üretme
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Tüm işletmeleri getirme
router.get("/", async (req, res) => {
  try {
    const businesses = await Business.find().populate("categoryId", "name");
    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// SAHİBİN İŞLETMELERİNİ GETİRME
router.get("/my-businesses", authMiddleware, async (req, res) => {
  try {
    const ownerId = req.user.ownerId || req.user.businessId; 
    if (!ownerId) return res.status(401).json({ message: "Yetkisiz erişim" });
    const businesses = await Business.find({ ownerId });
    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Tekil işletme getirme
router.get("/:id", async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate("categoryId", "name");
    if (!business) return res.status(404).json({ message: "İşletme bulunamadı" });
    res.status(200).json(business);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// GEREKSİNİM 5: İŞLETME ÜYE OLMA (BusinessOwner + ilk İşletme)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address, description, categoryId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email ve password zorunludur",
      });
    }

    const existingOwner = await BusinessOwner.findOne({ email });
    if (existingOwner) {
      return res.status(409).json({
        message: "Bu email adresi zaten kullanılıyor",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const newOwner = new BusinessOwner({
      name,
      email,
      password: hashedPassword,
      verificationCode
    });

    const savedOwner = await newOwner.save();

    const newBusiness = new Business({
      ownerId: savedOwner._id,
      name,
      email,
      phone,
      address,
      description,
      categoryId,
    });

    await newBusiness.save();

    // E-posta gönder
    try {
      await mailer.sendVerificationEmail(email, verificationCode);
    } catch (mailError) {
      console.error("E-posta gönderilemedi:", mailError);
    }

    res.status(201).json({
      message: "Kayıt başarılı. Lütfen e-postanıza gelen kodu doğrulayın.",
      owner: {
        _id: savedOwner._id,
        name: savedOwner.name,
        email: savedOwner.email,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// E-posta Doğrulama İşlemi (İşletme)
router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    const owner = await BusinessOwner.findOne({ email });

    if (!owner) {
      return res.status(404).json({ message: "İşletme sahibi bulunamadı" });
    }

    if (owner.verificationCode !== code) {
      return res.status(400).json({ message: "Geçersiz doğrulama kodu" });
    }

    owner.isVerified = true;
    owner.verificationCode = undefined;
    await owner.save();

    res.status(200).json({ message: "E-posta başarıyla doğrulandı" });
  } catch (error) {
    res.status(500).json({ message: "Doğrulama hatası", error: error.message });
  }
});

// GEREKSİNİM 6: İŞLETME GİRİŞ (BusinessOwner Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email ve şifre zorunludur" });
    }

    const owner = await BusinessOwner.findOne({ email });
    if (!owner) {
      return res.status(401).json({ message: "Email veya şifre hatalı" });
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email veya şifre hatalı" });
    }

    if (!owner.isVerified) {
      return res.status(403).json({ 
        message: "Lütfen önce e-postanızı doğrulayın", 
        needsVerification: true,
        email: owner.email 
      });
    }

    const token = jwt.sign(
      { ownerId: owner._id, email: owner.email, role: 'business_owner' },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Giriş başarılı",
      token,
      owner: {
        _id: owner._id,
        name: owner.name,
        email: owner.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// --- ŞİFRE SIFIRLAMA (İŞLETME) ---

// 1. Kod Gönder
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const owner = await BusinessOwner.findOne({ email });

    if (!owner) {
      return res.status(404).json({ message: "Bu e-posta adresiyle kayıtlı işletme sahibi bulunamadı." });
    }

    const resetCode = generateVerificationCode();
    owner.verificationCode = resetCode;
    await owner.save();

    await mailer.sendVerificationEmail(email, resetCode);

    res.status(200).json({ message: "Şifre sıfırlama kodu e-postanıza gönderildi." });
  } catch (error) {
    res.status(500).json({ message: "Hata oluştu", error: error.message });
  }
});

// 2. Şifreyi Güncelle
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const owner = await BusinessOwner.findOne({ email });

    if (!owner || owner.verificationCode !== code) {
      return res.status(400).json({ message: "Geçersiz kod veya e-posta." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    owner.password = hashedPassword;
    owner.verificationCode = undefined;
    await owner.save();

    res.status(200).json({ message: "Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz." });
  } catch (error) {
    res.status(500).json({ message: "Şifre güncellenemedi", error: error.message });
  }
});

// GEREKSİNİM 7: İŞLETME OLUŞTURMA (Var olan owner'a yeni şube/işletme ekleme)
// POST /businesses
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, address, description, categoryId } = req.body;
    const ownerId = req.user.ownerId || req.user.businessId;

    if (!ownerId) {
      return res.status(401).json({ message: "Yetkisiz işlem. İşletme sahibi bulunamadı." });
    }

    if (!name || !email) {
      return res.status(400).json({
        message: "name ve email zorunludur",
      });
    }

    const newBusiness = new Business({
      ownerId,
      name,
      email,
      phone,
      address,
      description,
      categoryId,
    });

    const savedBusiness = await newBusiness.save();

    res.status(201).json({
      message: "Yeni işletme başarıyla eklendi",
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
// İŞLETME BİLGİLERİNİ GÜNCELLEME (Fotoğraf URL'si vb. dahil)
// PUT /businesses/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const ownerId = req.user.ownerId || req.user.businessId;
    if (!ownerId) {
      return res.status(401).json({ message: "Yetkisiz işlem." });
    }

    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: "İşletme bulunamadı" });
    }

    // İşletmenin sahibi olup olmadığını kontrol et
    if (business.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: "Bu işletmeyi güncelleme yetkiniz yok." });
    }

    const { name, email, phone, address, description, categoryId, imageUrl, gallery } = req.body;

    business.name = name || business.name;
    business.email = email || business.email;
    business.phone = phone !== undefined ? phone : business.phone;
    business.address = address !== undefined ? address : business.address;
    business.description = description !== undefined ? description : business.description;
    business.categoryId = categoryId || business.categoryId;
    business.imageUrl = imageUrl !== undefined ? imageUrl : business.imageUrl;
    business.gallery = gallery !== undefined ? gallery : business.gallery;

    const updatedBusiness = await business.save();
    res.status(200).json({ message: "İşletme güncellendi", business: updatedBusiness });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

module.exports = router;