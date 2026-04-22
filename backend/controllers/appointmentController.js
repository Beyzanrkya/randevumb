const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");

// 4. Randevu Oluşturma
exports.createAppointment = async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body); // Gelen verilerle nesne oluştur
    await newAppointment.save();

    // Müşteriye bildirim yolla
    await new Notification({
      recipientId: newAppointment.customerId,
      recipientModel: "Customer",
      message: `Randevunuz başarıyla oluşturuldu: ${newAppointment.date} / ${newAppointment.time}`
    }).save();

    // İşletmeye bildirim yolla
    await new Notification({
      recipientId: newAppointment.businessId,
      recipientModel: "Business",
      message: `Yeni bir randevu aldınız: ${newAppointment.date} / ${newAppointment.time}`
    }).save();

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