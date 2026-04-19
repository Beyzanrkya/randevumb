const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const appointmentController = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/auth");

// GEREKSİNİM 1: RANDEVU GÜNCELLEME
// PUT /appointments/:appointmentId
router.put("/:appointmentId", authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { date, time, status, note } = req.body;

    const updateData = {};
    if (date) updateData.date = date;
    if (time) updateData.time = time;
    if (status) updateData.status = status;
    if (note !== undefined) updateData.note = note;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Randevu bulunamadı" });
    }

    res.status(200).json({
      message: "Randevu başarıyla güncellendi",
      appointment: updatedAppointment,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Geçersiz randevu ID'si" });
    }
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// GEREKSİNİM 8: İŞLETMEYE AİT RANDEVULARI LİSTELEME
// GET /appointments?businessId={businessId}
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { businessId, customerId } = req.query;

    const filter = {};
    if (businessId) filter.businessId = businessId;
    if (customerId) filter.customerId = customerId;

    const appointments = await Appointment.find(filter)
      .populate("customerId", "name email")
      .populate("businessId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Randevular getirildi",
      appointments,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// 4. Randevu Oluşturma
router.post("/", authMiddleware, appointmentController.createAppointment);

// 5. Randevu Listeleme (Müşteri için özel)
//router.get("/", authMiddleware, appointmentController.getCustomerAppointments);

// 6. Randevu Silme (İptal)
router.delete("/:appointmentId", authMiddleware, appointmentController.deleteAppointment);

module.exports = router;