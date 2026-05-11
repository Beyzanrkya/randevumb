const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Business = require('./models/Business');

async function updateBusinessCategories() {
  try {
    console.log("Veritabanına bağlanılıyor...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Bağlantı başarılı.\n");

    const updates = [
      { name: "Fit Yaşam Diyetisyen", category: "Sağlık & Diyet" },
      { name: "PlayStation Salonu", category: "Eğlence & Etkinlik" },
      { name: "Elvan Zihin Psikolojisi", category: "Psikoloji & Danışmanlık" },
      { name: "Nazlı Yoga Stüdyosu", category: "Spor & Fitness" },
      { name: "Yasemin mutfak atölyesi", category: "Eğitim & Kurs" }
    ];

    for (const update of updates) {
      // regex ile küçük büyük harf duyarsız arama yapıyoruz
      const result = await Business.updateOne(
        { name: new RegExp(`^${update.name}`, 'i') },
        { $set: { category: update.category } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ ${update.name} güncellendi: ${update.category}`);
      } else {
        console.log(`❌ ${update.name} bulunamadı.`);
      }
    }

    console.log("\nGüncelleme işlemi tamamlandı.");
    process.exit(0);
  } catch (err) {
    console.error("Hata oluştu:", err);
    process.exit(1);
  }
}

updateBusinessCategories();
