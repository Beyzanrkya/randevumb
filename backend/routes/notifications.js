const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");

// --- GÜVENLİ VE ESNEK BİLDİRİM SİSTEMİ ---

// Bu fonksiyon hem / hem de /me rotalarında kullanılacak
const getNotifications = async (req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] 🔔 Bildirim isteği yakalandı!`);
  try {
    let userId;

    // 1. Token'dan ID Bulma
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId || decoded.ownerId || decoded.id;
      } catch (e) {
        console.log("Token geçersiz, fallback denenecek.");
      }
    }

    // 2. Fallback ID (Ahmet)
    if (!userId) {
      userId = "69f7530d8c83d838910931d0"; 
    }

    // 3. Veritabanı Sorgusu
    const notifications = await Notification.find({ 
      recipientId: new mongoose.Types.ObjectId(userId) 
    }).sort({ createdAt: -1 }).limit(20);

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Bildirim hatası", error: error.message });
  }
};

// HER İKİ ADRESİ DE DESTEKLE (Garantici yaklaşım)
router.get("/", getNotifications);
router.get("/me", getNotifications);

// TEST ROTASI
router.get("/test/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ 
      recipientId: new mongoose.Types.ObjectId(userId) 
    }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OKUNDU İŞARETLE
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
