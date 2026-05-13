const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Business = require("../models/Business");
const Service = require("../models/Service");
const authMiddleware = require("../middleware/auth");
const Notification = require("../models/Notification");
const Customer = require("../models/Customer");
const Loyalty = require("../models/Loyalty");
const BusinessOwner = require("../models/BusinessOwner");
const mailer = require("../utils/mailer");
const { amqpChannel } = require("../utils/infrastructure");

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

      // 1. Müşteriye bildir (Uygulama içi ve Email)
      try {
        await new Notification({
          recipientId: newAppointment.customerId,
          recipientModel: "Customer",
          message: `Randevu Talebi Alındı: ${business.name} işletmesinde ${date} günü saat ${time} için randevunuz oluşturuldu. İşletme onayı bekleniyor.`
        }).save();

        if (customer && customer.email) {
          await mailer.sendAppointmentEmail(customer.email, {
            type: 'booking_confirmation',
            customerName: customer.name,
            businessName: business.name,
            date: date,
            time: time,
            serviceName: service ? service.name : ''
          });
        }
        console.log("Müşteri bildirimi ve maili gönderildi.");
      } catch (e) {
        console.error("Müşteri bildirim/mail hatası:", e.message);
      }

      if (business.ownerId) {
        const owner = await BusinessOwner.findById(business.ownerId);

        // 2. İşletme Sahibine ve İşletme Mailine bildir
        try {
          // Uygulama içi bildirim (Sahibine - Dükkan bazlı)
          await new Notification({
            recipientId: business.ownerId,
            recipientModel: "BusinessOwner",
            businessId: business._id,
            message: `Yeni Randevu! ${customer ? customer.name : 'Bir müşteri'}, ${date} saat ${time} için ${service ? service.name : 'bir hizmet'} randevusu aldı.`
          }).save();

          // Email Gönderimi (Hem sahibine hem işletmeye)
          const targetEmails = [];
          if (owner && owner.email) targetEmails.push(owner.email);
          if (business.email && business.email !== owner?.email) targetEmails.push(business.email);

          for (const email of targetEmails) {
            await mailer.sendAppointmentEmail(email, {
              type: 'new_to_business',
              customerName: customer ? customer.name : 'Bir müşteri',
              businessName: business.name,
              date: date,
              time: time,
              serviceName: service ? service.name : ''
            });
          }
          
          console.log(`İşletme bildirimi ve ${targetEmails.length} adrese mail gönderildi.`);
        } catch (e) {
          console.error("İşletme bildirim/mail hatası:", e.message);
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

// Randevu durumu güncelleme (İptal vs)
router.put("/:id", async (req, res) => {
  try {
    const { status, note, date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Randevu bulunamadı" });
    }

    const oldStatus = appointment.status;
    const oldDate = appointment.date || "Belirtilmemiş";
    const oldTime = appointment.time || "Belirtilmemiş";

    console.log(`🔄 Güncelleme Öncesi: ${oldDate} ${oldTime}`);
    console.log(`📥 Gelen Yeni Veri: Date: ${date}, Time: ${time}`);

    if (note !== undefined) appointment.note = note;
    if (date !== undefined) appointment.date = date;
    if (time !== undefined) appointment.time = time;

    const isDateTimeChanged = (date !== undefined && date !== oldDate) || (time !== undefined && time !== oldTime);
    console.log(`❓ Zaman Değişti mi: ${isDateTimeChanged}`);

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
      console.log(`✅ Puan Verildi: Müşteri ${appointment.customerId}, İşletme ${appointment.businessId}, Yeni Puan: ${loyalty.points}`);
    }

    appointment.status = status;
    const updated = await appointment.save();

    // --- BİLDİRİM VE MAİL SİSTEMİ ---
    if (oldStatus !== status || isDateTimeChanged) {
      try {
        const business = await Business.findById(appointment.businessId);
        const customer = await Customer.findById(appointment.customerId);

        if (!business) {
          console.error("Hata: İşletme bulunamadı, durum bildirimi gönderilemez.");
          return res.json({ message: "Güncellendi ancak bildirim gönderilemedi", appointment: updated });
        }

        let statusText = status === 'confirmed' ? 'onaylandı' :
          status === 'cancelled' ? 'reddedildi/iptal edildi' :
            status === 'completed' ? 'tamamlandı' : status;

        const bName = business?.name || "İşletme";
        const newD = appointment.date || date || "Bilinmiyor";
        const newT = appointment.time || time || "Bilinmiyor";
        
        let message = `Randevu Durumu: ${bName} için ${newD} tarihindeki randevunuz ${statusText}.${pointsMessage}`;
        
        if (status === 'cancelled' && appointment.note) {
          message = `Randevu İptal: ${bName} işletmesindeki randevunuz iptal edildi. Sebep: ${appointment.note}`;
        }

        if (isDateTimeChanged && oldStatus === status) {
          message = `Randevu Güncellemesi: ${bName} işletmesindeki randevunuz ${oldDate} ${oldTime} vaktinden ${newD} ${newT} vaktine alınmıştır.`;
        }

        console.log(`📢 Giden Bildirim Mesajı: ${message}`);

        // --- RABBITMQ İLE BİLDİRİMİ KUYRUĞA AT ---
        if (amqpChannel) {
          const notificationData = {
            recipientId: appointment.customerId,
            recipientModel: "Customer",
            message: message
          };
          
          amqpChannel.assertQueue("notifications_queue", { durable: true });
          amqpChannel.sendToQueue("notifications_queue", Buffer.from(JSON.stringify(notificationData)));
        } else {
          await new Notification({
            recipientId: appointment.customerId,
            recipientModel: "Customer",
            message: message
          }).save();
        }

        // Müşteriye bildir (Email)
        if (customer && customer.email) {
          await mailer.sendAppointmentEmail(customer.email, {
            type: isDateTimeChanged ? 'rescheduled' : 'status_update',
            status: status,
            statusText: statusText,
            customerName: customer.name,
            businessName: business ? business.name : 'MBrandev İşletmesi',
            date: appointment.date,
            time: appointment.time,
            extraMessage: pointsMessage 
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