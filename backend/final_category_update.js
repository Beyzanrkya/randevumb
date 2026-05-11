const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Business = require('./models/Business');

async function finalCategoryUpdate() {
  try {
    console.log("Veritabanına bağlanılıyor...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Bağlantı başarılı.\n");

    const updates = [
      { name: "Fit Yaşam Diyetisyen", category: "Sağlık & Diyet" },
      { name: "PlayStation Salonu", category: "Eğlence & Etkinlik" },
      { name: "Elvan Zihin Psikolojisi", category: "Psikoloji & Danışmanlık" },
      { name: "Nazlı Yoga Stüdyosu", category: "Spor & Fitness" },
      { name: "Yasemin mutfak atölyesi", category: "Yemek" }
    ];

    for (const update of updates) {
      const result = await Business.updateOne(
        { name: new RegExp(`^${update.name}`, 'i') },
        { $set: { category: update.category } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ ${update.name} -> ${update.category} olarak güncellendi.`);
      } else {
        console.log(`❌ ${update.name} bulunamadı.`);
      }
    }

    console.log("\nTüm güncellemeler tamamlandı.");
    process.exit(0);
  } catch (err) {
    console.error("Hata:", err);
    process.exit(1);
  }
}

finalCategoryUpdate();
