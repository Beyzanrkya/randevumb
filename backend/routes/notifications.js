const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/auth");

// GET /notifications/me
router.get("/me", async (req, res) => {
  try {
    let userId;
    
    // Auth header kontrolü
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.ownerId || decoded.userId || decoded.businessId || decoded.id;
      } catch (e) {
        console.log("Token doğrulama hatası, query param denenecek.");
      }
    }

    // Query param kontrolü (Mobil test için fallback)
    if (!userId) {
      userId = req.query.userId || req.query.userid;
    }

    if (!userId) {
      return res.status(401).json({ 
        message: "Kullanıcı kimliği bulunamadı (401)", 
        debug_query: req.query 
      });
    }

    const notifications = await Notification.find({ recipientId: userId }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Bildirimler alınamadı", error: error.message });
  }
});

// TEST ROTASI: Mobil uygulama için güvenli (Auth gerektirmez)
router.get("/test/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ recipientId: userId }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Test bildirimi hatası", error: error.message });
  }
});

// PUT /notifications/:id/read
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Güncelleme hatası", error: error.message });
  }
});

module.exports = router;
