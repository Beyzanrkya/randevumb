const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessOwner", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true }, // Not unique anymore
    phone: { type: String },
    address: { type: String },
    description: { type: String },
    imageUrl: { type: String }, // İşletme fotoğrafı için eklendi
    gallery: [{ type: String }], // İşletme portföy fotoğrafları için eklendi
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);