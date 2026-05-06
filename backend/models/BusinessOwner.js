const mongoose = require("mongoose");

const businessOwnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessOwner", businessOwnerSchema);
