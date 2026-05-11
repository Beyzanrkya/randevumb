const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Business = require("../models/Business");
const Service = require("../models/Service");
const authMiddleware = require("../middleware/auth");

// --- TÜM RANDEVULARI LİSTELEME (TEST İÇİN HERKESE AÇIK) ---
router.get("/", async (req, res) => {
  try {
    const { businessId, customerId } = req.query;
    let filter = {};

    if (businessId) filter.businessId = businessId;
    if (customerId) filter.customerId = customerId;

    console.log("Randevu filtresi:", filter);

    const appointments = await Appointment.find(filter)
      .populate("customerId", "name email")
      .populate("businessId", "name email address")
      .populate("serviceId", "name price duration")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Randevular başarıyla getirildi",
      count: appointments.length,
      appointments: appointments
    });
  } catch (error) {
    console.error("Randevu listeleme hatası:", error);
    res.status(500).json({ message: "Randevular getirilemedi", error: error.message });
  }
});

const Notification = require("../models/Notification");
const Customer = require("../models/Customer");
const BusinessOwner = require("../models/BusinessOwner");
const mailer = require("../utils/mailer");

// Randevu oluşturma
router.post("/", async (req, res) => {
  try {
    const { customerId, businessId, serviceId, date, time, note } = req.body;
    
    const newAppointment = new Appointment({
      customerId: customerId || "69f7530d8c83d838910931d0", // Ahmet ID default
      businessId,
      serviceId,
      date,
      time,
      note,
      status: "pending"
    });

    await newAppointment.save();

    // --- BİLDİRİM VE MAİL SİSTEMİ ---
    try {
      const business = await Business.findById(businessId);
      const service = await Service.findById(serviceId);
      const customer = await Customer.findById(newAppointment.customerId);
      
      if (!business) {
        console.error("Hata: İşletme bulunamadı, bildirim oluşturulamaz.");
        return;
      }

      // 1. Müşteriye bildir (Uygulama içi) - EN ÖNEMLİSİ
      try {
        await new Notification({
          recipientId: newAppointment.customerId,
          recipientModel: "Customer",
          message: `Randevu Başarılı: ${business.name} işletmesinden ${date} ${time} saatine randevu aldınız. Onay bekleniyor.`
        }).save();
        console.log("Müşteri bildirimi kaydedildi.");
      } catch (e) {
        console.error("Müşteri bildirimi oluşturulamadı:", e.message);
      }

      if (business.ownerId) {
        const owner = await BusinessOwner.findById(business.ownerId);
        
        // Uygulama içi bildirim
        try {
          await new Notification({
            recipientId: business.ownerId,
            recipientModel: "BusinessOwner",
            message: `Yeni Randevu Talebi: ${customer ? customer.name : 'Bir müşteri'}, ${service ? service.name : 'bir hizmet'} için ${date} ${time} tarihine randevu almak istiyor.`
          }).save();
        } catch (e) {
          console.error("İşletme sahibi bildirimi oluşturulamadı:", e.message);
        }

        // Email bildirimi
        if (owner && owner.email) {
          try {
            await mailer.sendAppointmentEmail(owner.email, {
              type: 'new_to_business',
              customerName: customer ? customer.name : 'Bir müşteri',
              businessName: business.name,
              date: date,
              time: time,
              serviceName: service ? service.name : ''
            });
          } catch (e) {
            console.error("İşletme sahibi maili gönderilemedi:", e.message);
          }
        }
      }
    } catch (globalNotifErr) {
      console.error("Genel bildirim hatası:", globalNotifErr);
    }

    res.status(201).json({ message: "Randevu başarıyla oluşturuldu", appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ message: "Randevu oluşturulamadı", error: error.message });
  }
});

const Loyalty = require("../models/Loyalty");

// Randevu durumu güncelleme (İptal vs)
router.put("/:id", async (req, res) => {
  try {
    const { status, note } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: "Randevu bulunamadı" });
    }

    const oldStatus = appointment.status;
    if (note !== undefined) appointment.note = note;

    let pointsMessage = "";

    // Puan verme mantığı: Sadece tamamlandı durumunda ve daha önce puan verilmediyse
    if (status === "completed" && !appointment.pointsAwarded) {
      const loyalty = await Loyalty.findOneAndUpdate(
        { customerId: appointment.customerId, businessId: appointment.businessId },
        { $inc: { points: 10 } },
        { upsert: true, new: true }
      );
      appointment.pointsAwarded = true;
      pointsMessage = " 🎉 Tebrikler! Bu randevudan 10 sadakat puanı kazandınız!";
    }

    appointment.status = status;
    const updated = await appointment.save();

    // --- BİLDİRİM VE MAİL SİSTEMİ ---
    if (oldStatus !== status) {
      try {
        const business = await Business.findById(appointment.businessId);
        const customer = await Customer.findById(appointment.customerId);
        
        if (!business) {
          console.error("Hata: İşletme bulunamadı, durum bildirimi gönderilemez.");
          return res.json({ message: "Durum güncellendi ancak bildirim gönderilemedi", appointment: updated });
        }

        let statusText = status === 'confirmed' ? 'onaylandı' : 
                         status === 'cancelled' ? 'reddedildi/iptal edildi' : 
                         status === 'completed' ? 'tamamlandı' : status;
        
        // Müşteriye bildir (Uygulama içi)
        await new Notification({
          recipientId: appointment.customerId,
          recipientModel: "Customer",
          message: `Randevu Durumu: ${business ? business.name : 'İşletme'} için ${appointment.date} tarihindeki randevunuz ${statusText}.${pointsMessage}`
        }).save();

        // Müşteriye bildir (Email)
        if (customer && customer.email) {
          await mailer.sendAppointmentEmail(customer.email, {
            type: 'status_update',
            status: status,
            statusText: statusText,
            customerName: customer.name,
            businessName: business ? business.name : 'MBrandev İşletmesi',
            date: appointment.date,
            time: appointment.time,
            extraMessage: pointsMessage // Puan bilgisini maile ekle
          });
        }
      } catch (notifErr) {
        console.error("Bildirim/Mail güncelleme hatası:", notifErr);
      }
    }
    
    res.json({ message: "Durum güncellendi", appointment: updated });
  } catch (error) {
    res.status(500).json({ message: "Güncelleme başarısız", error: error.message });
  }
});

// --- HAFTALIK İSTATİSTİKLER ---
router.get("/stats/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const stats = await Promise.all(last7Days.map(async (date) => {
      const count = await Appointment.countDocuments({
        businessId,
        date: date // Tarih formatı 'YYYY-MM-DD' varsayılıyor
      });
      return { date, count };
    }));

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "İstatistikler alınamadı", error: error.message });
  }
});

module.exports = router;