const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessOwner", required: true },
    name: { type: String, required: true },
    email: { type: String }, // Artık zorunlu değil (Owner email'i kullanılabilir)
    phone: { type: String },
    address: { type: String },
    description: { type: String },
    category: { type: String }, // Hızlı kategori gösterimi için eklendi
    imageUrl: { type: String }, 
    gallery: [{ type: String }], 
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);