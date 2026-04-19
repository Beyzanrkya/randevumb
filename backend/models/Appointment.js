const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", // Senin oluşturduğun model ismiyle aynı olmalı
      required: [true, "Müşteri ID zorunludur"],
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: [true, "İşletme ID zorunludur"],
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Hizmet ID zorunludur"],
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, "Tarih zorunludur"],
    },
    time: {
      type: String, // HH:MM
      required: [true, "Saat zorunludur"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);