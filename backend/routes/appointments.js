const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const Business = require("../models/Business");
const appointmentController = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/auth");
const mailer = require("../utils/mailer");
const Customer = require("../models/Customer");
const Loyalty = require("../models/Loyalty");

// GEREKSİNİM 1: RANDEVU GÜNCELLEME
// PUT /appointments/:appointmentId
router.put("/:appointmentId", authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { date, time, status, note } = req.body;

    const updateData = {};
    if (date) updateData.date = date;
    if (time) updateData.time = time;
    if (status) {
      updateData.status = status;
      // Eğer durum "completed" değilse, puan verildi işaretini sıfırla
      if (status !== "completed") {
        updateData.pointsAwarded = false;
      }
    }
    if (note !== undefined) updateData.note = note;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Randevu bulunamadı" });
    }

    // BİLDİRİM GÖNDERME MANTIĞI
    const noteSuffix = updatedAppointment.note ? ` - Not: ${updatedAppointment.note}` : "";
    const customer = await Customer.findById(updatedAppointment.customerId);
    const business = await Business.findById(updatedAppointment.businessId);
    
    let statusText = "";
    if (status === "confirmed") statusText = "Onaylandı";
    else if (status === "cancelled") statusText = "İptal Edildi";
    else if (status === "rejected") statusText = "Reddedildi";
    else if (status === "completed") statusText = "Tamamlandı";

    // PUAN KAZANDIRMA MANTIĞI
    if (updatedAppointment.status === "completed" && !updatedAppointment.pointsAwarded) {
      const cId = updatedAppointment.customerId.toString();
      const bId = updatedAppointment.businessId.toString();

      console.log(`[LOYALTY] Puan ekleme tetiklendi: Müşteri:${cId}, İşletme:${bId}`);

      try {
        // Mevcut puanı bul veya oluştur ve 10 artır
        const loyaltyDoc = await Loyalty.findOneAndUpdate(
          { 
            customerId: updatedAppointment.customerId, 
            businessId: updatedAppointment.businessId 
          },
          { 
            $inc: { points: 10 }, 
            $set: { updatedAt: Date.now() } 
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        console.log(`[LOYALTY] Puan başarıyla güncellendi. Kullanıcı: ${cId}, Yeni Puan: ${loyaltyDoc.points}`);

        // Randevuyu "puan verildi" olarak işaretle
        await Appointment.findByIdAndUpdate(appointmentId, { $set: { pointsAwarded: true } });
      } catch (loyaltyErr) {
        console.error("[LOYALTY] KRİTİK HATA:", loyaltyErr.message);
      }
    }

    if (statusText) {
      // Uygulama içi bildirim
      await new Notification({
        recipientId: updatedAppointment.customerId,
        recipientModel: "Customer",
        message: `${business ? business.name : "İşletme"} randevunuzu ${statusText.toLowerCase()}! Tarih: ${updatedAppointment.date} Saat: ${updatedAppointment.time}${noteSuffix}`
      }).save();

      // E-posta bildirimi
      if (customer && customer.email) {
        await mailer.sendAppointmentEmail(customer.email, {
          type: 'status_update',
          status: status,
          statusText: statusText,
          customerName: customer.name,
          businessName: business ? business.name : "MBrandev İşletmesi",
          date: updatedAppointment.date,
          time: updatedAppointment.time
        });
      }
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

// 6. Randevu Silme (İptal)
router.delete("/:appointmentId", authMiddleware, appointmentController.deleteAppointment);

// 7. İşletme İstatistiklerini Getirme
router.get("/stats/:businessId", authMiddleware, appointmentController.getBusinessStats);

// 8. Haftalık Grafik Verileri
router.get("/weekly-stats/:businessId", authMiddleware, appointmentController.getWeeklyStats);

module.exports = router;