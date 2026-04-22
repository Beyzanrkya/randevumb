const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/auth");

// GET /notifications/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.businessId; // Müşteri veya İşletme
    const notifications = await Notification.find({ recipientId: userId }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Bildirimler alınamadı", error: error.message });
  }
});

// PUT /notifications/:id/read
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Güncelleme hatası", error: error.message });
  }
});

module.exports = router;
