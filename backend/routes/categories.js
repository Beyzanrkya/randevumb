const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Business = require("../models/Business");

// Tüm kategorileri getirme
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// GEREKSİNİM 9: KATEGORİ LİSTELEME (ID BAZLI)
// GET /categories/:categoryId
router.get("/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

    const businesses = await Business.find({ categoryId }).select("-password");

    res.status(200).json({
      message: "Kategori getirildi",
      category,
      businesses,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Geçersiz kategori ID'si" });
    }
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

module.exports = router;