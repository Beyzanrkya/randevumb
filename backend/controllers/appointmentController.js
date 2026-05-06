const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const mailer = require("../utils/mailer");

// 4. Randevu Oluşturma
exports.createAppointment = async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body); // Gelen verilerle nesne oluştur
    await newAppointment.save();

    // İşletme, Müşteri ve Hizmet bilgilerini çek
    const Business = require("../models/Business");
    const Customer = require("../models/Customer");
    const Service = require("../models/Service");
    const BusinessOwner = require("../models/BusinessOwner");

    const business = await Business.findById(newAppointment.businessId);
    const customer = await Customer.findById(newAppointment.customerId);
    const service = await Service.findById(newAppointment.serviceId);

    // Müşteriye bildirim yolla
    await new Notification({
      recipientId: newAppointment.customerId,
      recipientModel: "Customer",
      message: `${business ? business.name : "İşletme"} için randevunuz başarıyla oluşturuldu! Tarih: ${newAppointment.date} Saat: ${newAppointment.time} - Konum: ${business ? (business.address || "Belirtilmemiş") : "Belirtilmemiş"}`
    }).save();

    // İşletme sahibine bildirim yolla
    if (business && business.ownerId) {
      const customerName = customer ? customer.name : "Bir müşteri";
      const serviceName = service ? service.name : "bir hizmet";
      
      await new Notification({
        recipientId: business.ownerId,
        recipientModel: "BusinessOwner",
        message: `${customerName} sizin ${business.name} işletmenizdeki ${serviceName} hizmeti için ${newAppointment.date} ${newAppointment.time} tarihine randevu almak istiyor.`
      }).save();

      // İşletme sahibine e-posta gönder
      const owner = await BusinessOwner.findById(business.ownerId);
      if (owner && owner.email) {
        await mailer.sendAppointmentEmail(owner.email, {
          type: 'new_to_business',
          customerName: customerName,
          businessName: business.name,
          date: newAppointment.date,
          time: newAppointment.time,
          serviceName: serviceName
        });
      }
    }

    res.status(201).json(newAppointment); // Başarılı kayıt
  } catch (err) {
    res.status(400).json({ message: "Randevu oluşturulamadı", error: err.message });
  }
};

// 5. Randevu Listeleme (Müşteri Bazlı)
exports.getCustomerAppointments = async (req, res) => {
  try {
    // Tasarımdaki query parametresine göre filtreleme yapıyoruz
    const appointments = await Appointment.find({ customerId: req.query.customerId });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Listeleme hatası" });
  }
};

// 6. Randevu Silme (İptal)
exports.deleteAppointment = async (req, res) => {
  try {
    const result = await Appointment.findByIdAndDelete(req.params.appointmentId);
    if (!result) return res.status(404).json({ message: "Randevu bulunamadı" });
    res.status(204).send(); // Silme işlemi başarılı (No Content)
  } catch (err) {
    res.status(400).json({ message: "Silme hatası" });
  }
};

// 7. İşletme İstatistiklerini Getirme
exports.getBusinessStats = async (req, res) => {
  try {
    const { businessId } = req.params;
    const mongoose = require("mongoose");
    
    const stats = await Appointment.aggregate([
      { $match: { businessId: new mongoose.Types.ObjectId(businessId) } },
      { $group: {
          _id: null,
          total: { $sum: 1 },
          confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } }
        }
      }
    ]);

    const defaultStats = { total: 0, confirmed: 0, pending: 0, cancelled: 0 };
    res.status(200).json(stats[0] || defaultStats);
  } catch (err) {
    res.status(500).json({ message: "İstatistikler hesaplanamadı", error: err.message });
  }
};

// 8. Haftalık İstatistikler (Grafik için)
exports.getWeeklyStats = async (req, res) => {
  try {
    const { businessId } = req.params;
    const mongoose = require("mongoose");
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0,0,0,0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const stats = await Appointment.aggregate([
      { 
        $match: { 
          businessId: new mongoose.Types.ObjectId(businessId),
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const found = stats.find(s => s._id === dateStr);
      result.push({
        name: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
        tarih: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
        randevu: found ? found.count : 0
      });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "İstatistikler hesaplanamadı", error: error.message });
  }
};