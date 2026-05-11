const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Appointment = require('./models/Appointment');

async function seedAppointments() {
  try {
    console.log("Veritabanına bağlanılıyor...");
    await mongoose.connect(process.env.MONGODB_URI);

    const businessId = "69f754fa8c83d83891093218"; // Fit Yaşam Diyetisyen
    const customerId = "69f754fa8c83d83891093210"; // Test Müşteri
    const serviceId = "69fdc6198f395b07908b9887"; // Örnek bir hizmet ID (backend'de varsa)

    const appointments = [
      {
        customerId,
        businessId,
        serviceId: "69fdc6198f395b07908b9887",
        date: "2026-05-15",
        time: "10:30",
        status: "confirmed",
        note: "İlk görüşme için heyecanlıyım."
      },
      {
        customerId,
        businessId,
        serviceId: "69fdc6198f395b07908b9888",
        date: "2026-05-20",
        time: "14:00",
        status: "pending"
      },
      {
        customerId,
        businessId,
        serviceId: "69fdc6198f395b07908b9887",
        date: "2026-04-10",
        time: "09:00",
        status: "completed"
      }
    ];

    await Appointment.deleteMany({ customerId });
    const saved = await Appointment.insertMany(appointments);
    
    console.log(`✅ ${saved.length} adet gerçek randevu veritabanına eklendi.`);
    process.exit(0);
  } catch (err) {
    console.error("Hata:", err);
    process.exit(1);
  }
}

seedAppointments();
