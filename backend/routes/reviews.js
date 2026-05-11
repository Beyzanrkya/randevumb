const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Review = require("../models/Review");
const authMiddleware = require("../middleware/auth");

// 1. Yorum Yap (POST /reviews)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { businessId, appointmentId, rating, comment } = req.body;
    const rawCustomerId = req.user.userId || req.body.customerId;

    if (!businessId || !rating || !comment) {
      return res.status(400).json({ message: "Eksik veri gönderildi (İşletme, Puan ve Yorum zorunludur)" });
    }

    const newReview = new Review({
      customerId: new mongoose.Types.ObjectId(rawCustomerId),
      businessId: new mongoose.Types.ObjectId(businessId),
      appointmentId: new mongoose.Types.ObjectId(appointmentId),
      rating,
      comment
    });

    await newReview.save();

    // İşletme Puanını Güncelle
    await updateBusinessRating(businessId);

    res.status(201).json({ message: "Yorumunuz için teşekkürler!", review: newReview });
  } catch (error) {
    res.status(500).json({ message: "Yorum kaydedilemedi", error: error.message });
  }
});

// 2. İşletmeye Ait Yorumları Getir (GET /reviews/business/:businessId)
router.get("/business/:businessId", async (req, res) => {
  try {
    const bId = req.params.businessId;
    const reviews = await Review.find({ businessId: bId })
      .populate("customerId", "name profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Yorumlar getirilemedi", error: error.message });
  }
});

// 3. Yorum Güncelle (PUT /reviews/:reviewId)
router.put("/:reviewId", authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) return res.status(404).json({ message: "Yorum bulunamadı" });

    // Sadece yorum sahibi güncelleyebilir
    if (review.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    // İşletme puanını yeniden hesapla
    await updateBusinessRating(review.businessId);

    res.status(200).json({ message: "Yorum güncellendi", review });
  } catch (error) {
    res.status(500).json({ message: "Güncelleme hatası", error: error.message });
  }
});

// 4. Yorum Sil (DELETE /reviews/:reviewId)
router.delete("/:reviewId", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Yorum bulunamadı" });

    if (review.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    const businessId = review.businessId;
    await review.deleteOne();

    // İşletme puanını yeniden hesapla
    await updateBusinessRating(businessId);

    res.status(200).json({ message: "Yorum silindi" });
  } catch (error) {
    res.status(500).json({ message: "Silme hatası", error: error.message });
  }
});

// Yardımcı fonksiyon: İşletme puanını güncelle
async function updateBusinessRating(businessId) {
  const Business = require("../models/Business");
  const allReviews = await Review.find({ businessId });
  const count = allReviews.length;
  const avg = count > 0 ? allReviews.reduce((acc, r) => acc + r.rating, 0) / count : 0;

  await Business.findByIdAndUpdate(businessId, {
    averageRating: avg.toFixed(1),
    reviewCount: count
  });
}

// 5. İşletme Cevabı (POST /reviews/:reviewId/reply)
router.post("/:reviewId/reply", authMiddleware, async (req, res) => {
  try {
    const { reply } = req.body;
    const { reviewId } = req.params;

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { businessReply: reply, repliedAt: Date.now() },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "Yorum bulunamadı" });
    }

    res.status(200).json({ message: "Cevabınız kaydedildi", review: updatedReview });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

module.exports = router;
