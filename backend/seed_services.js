const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Service = require('./models/Service');

async function seedServices() {
  try {
    console.log("Veritabanına bağlanılıyor...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Bağlantı başarılı.\n");

    const businessId = "69f754fa8c83d83891093218"; // Fit Yaşam Diyetisyen ID

    const services = [
      { businessId, name: "İlk Muayene & Diyet Programı", price: 500, duration: 60, description: "Kapsamlı vücut analizi ve size özel beslenme planı." },
      { businessId, name: "Haftalık Kontrol Seansı", price: 250, duration: 30, description: "Gelişim takibi ve program güncellenmesi." },
      { businessId, name: "Vücut Analizi (Tanita)", price: 150, duration: 15, description: "Yağ, kas ve su dengesi ölçümü." },
      { businessId, name: "Online Beslenme Danışmanlığı", price: 400, duration: 45, description: "Görüntülü görüşme ile diyet takibi." }
    ];

    // Önce eski hizmetleri temizle (isteğe bağlı)
    await Service.deleteMany({ businessId });
    
    const savedServices = await Service.insertMany(services);
    console.log(`✅ ${savedServices.length} adet hizmet başarıyla eklendi.`);

    process.exit(0);
  } catch (err) {
    console.error("Hata:", err);
    process.exit(1);
  }
}

seedServices();
