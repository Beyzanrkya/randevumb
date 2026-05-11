const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Business = require('./models/Business');

async function deleteBusiness() {
  try {
    console.log("Veritabanına bağlanılıyor...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Bağlantı başarılı.\n");

    const result = await Business.deleteOne({ name: "Semin mutfak atölyesi" });
    
    if (result.deletedCount > 0) {
      console.log("✅ 'Semin mutfak atölyesi' başarıyla silindi.");
    } else {
      console.log("⚠️ Silinecek kayıt bulunamadı (Zaten silinmiş olabilir).");
    }

    process.exit(0);
  } catch (err) {
    console.error("Hata oluştu:", err);
    process.exit(1);
  }
}

deleteBusiness();
