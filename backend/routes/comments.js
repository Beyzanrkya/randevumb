const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const authMiddleware = require("../middleware/auth");

// GEREKSİNİM 2: COMMENT EKLEME
// POST /comments
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { businessId, text, rating } = req.body;

    if (!businessId || !text) {
      return res.status(400).json({
        message: "businessId ve text zorunludur",
      });
    }

    const newComment = new Comment({
      customerId: req.body.customerId || req.user.userId || req.user.businessId,
      businessId,
      text,
      rating,
    });

    const savedComment = await newComment.save();

    res.status(201).json({
      message: "Yorum başarıyla eklendi",
      comment: savedComment,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// GEREKSİNİM 3: COMMENT GÜNCELLEME
// PUT /comments/:commentId
router.put("/:commentId", authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text, rating } = req.body;

    const updateData = {};
    if (text) updateData.text = text;
    if (rating) updateData.rating = rating;

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Yorum bulunamadı" });
    }

    res.status(200).json({
      message: "Yorum başarıyla güncellendi",
      comment: updatedComment,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Geçersiz yorum ID'si" });
    }
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// GEREKSİNİM 4: COMMENT SİLME
// DELETE /comments/:commentId
router.delete("/:commentId", authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ message: "Yorum bulunamadı" });
    }

    res.status(204).send();
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Geçersiz yorum ID'si" });
    }
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

module.exports = router;