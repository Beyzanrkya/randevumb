const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Müşteri ID zorunludur"],
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: [true, "İşletme ID zorunludur"],
    },
    text: {
      type: String,
      required: [true, "Yorum metni zorunludur"],
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);