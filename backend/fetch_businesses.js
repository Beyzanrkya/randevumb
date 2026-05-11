const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Business = require('./models/Business');

async function fetchBusinesses() {
  try {
    console.log("Veritabanına bağlanılıyor...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Bağlantı başarılı.\n");
    
    const businesses = await Business.find({});
    
    if (businesses.length === 0) {
      console.log("Veritabanında hiç işletme bulunamadı.");
    } else {
      console.log(`Toplam ${businesses.length} işletme bulundu:\n`);
      businesses.forEach((b, index) => {
        console.log(`${index + 1}. İşletme Adı: ${b.name}`);
        console.log(`   Kategori: ${b.category}`);
        console.log(`   Lokasyon: ${b.location || 'Belirtilmemiş'}`);
        console.log(`   ID: ${b._id}`);
        console.log("------------------------------------------");
      });
    }

    process.exit(0);
  } catch (err) {
    console.error("Hata oluştu:", err);
    process.exit(1);
  }
}

fetchBusinesses();
