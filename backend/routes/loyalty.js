const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const crypto = require("crypto");
const Loyalty = require("../models/Loyalty");
const Business = require("../models/Business");
const Customer = require("../models/Customer");
const authMiddleware = require("../middleware/auth");
const mailer = require("../utils/mailer");

// Giriş yapan müşterinin tüm sadakat puanlarını getir
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const loyalties = await Loyalty.find({ customerId: new mongoose.Types.ObjectId(req.user.id) })
      .populate("businessId", "name profilePicture")
      .sort({ updatedAt: -1 });

    res.json(loyalties);
  } catch (error) {
    res.status(500).json({ message: "Puanlar getirilemedi", error: error.message });
  }
});

// Belirli bir işletmedeki puanları getir
router.get("/business/:businessId", authMiddleware, async (req, res) => {
  try {
    const loyalty = await Loyalty.findOne({
      customerId: new mongoose.Types.ObjectId(req.user.id),
      businessId: new mongoose.Types.ObjectId(req.params.businessId),
    });

    res.json(loyalty || { points: 0 });
  } catch (error) {
    res.status(500).json({ message: "Puan getirilemedi", error: error.message });
  }
});

// DEBUG ROTASI: Herkese açık (Geçici)
router.get("/debug/:businessId", async (req, res) => {
  try {
    const bId = req.params.businessId;
    
    // Tüm sadakat kayıtlarını getir (Sadece teşhis için!)
    const allLoyalties = await Loyalty.find({ businessId: new mongoose.Types.ObjectId(bId) })
      .populate("customerId", "name email");
    
    res.json({
      message: "Sistemdeki Tüm Puan Kayıtları (Bu İşletme İçin)",
      businessId: bId,
      totalRecords: allLoyalties.length,
      records: allLoyalties
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Puan kullan (100 puan = Ücretsiz Hizmet)
router.post("/redeem", authMiddleware, async (req, res) => {
  try {
    const { businessId } = req.body;
    const loyalty = await Loyalty.findOne({
      customerId: new mongoose.Types.ObjectId(req.user.id),
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    if (!loyalty || loyalty.points < 100) {
      return res.status(400).json({ message: "Yetersiz puan. En az 100 puan gerekli." });
    }

    // Bilgileri getir (Email gönderimi için)
    const business = await Business.findById(businessId);
    const customer = await Customer.findById(req.user.id);

    // Benzersiz kod oluştur
    const redemptionCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    loyalty.points -= 100;
    await loyalty.save();

    // İşletmeye mail gönder
    if (business && business.email) {
      await mailer.sendRedemptionEmail(business.email, {
        customerName: customer ? customer.name : "Bir Müşteriniz",
        redemptionCode: redemptionCode
      });
    }

    res.json({ 
        message: "100 puan başarıyla kullanıldı!",
        redemptionCode: redemptionCode,
        remainingPoints: loyalty.points,
        instructions: "Aşağıdaki kodu veya QR kodu işletme yetkilisine gösterin. Ayrıca işletmeye bilgilendirme e-postası gönderilmiştir."
    });
  } catch (error) {
    res.status(500).json({ message: "Puan kullanılamadı", error: error.message });
  }
});

module.exports = router;
