const mongoose = require("mongoose");

const loyaltySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure unique combination of customer and business
loyaltySchema.index({ customerId: 1, businessId: 1 }, { unique: true });

module.exports = mongoose.model("Loyalty", loyaltySchema);
