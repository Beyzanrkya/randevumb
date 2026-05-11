const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Review = require('./models/Review');

async function removeFakeReviews() {
  try {
    console.log("Veritabanına bağlanılıyor...");
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Benim kullandığım test müşteri ID'si: 69f754fa8c83d83891093210
    const result = await Review.deleteMany({ 
      customerId: new mongoose.Types.ObjectId("69f754fa8c83d83891093210") 
    });
    
    console.log(`✅ ${result.deletedCount} adet örnek yorum silindi.`);
    
    // Kalan yorumları kontrol et
    const remaining = await Review.countDocuments({});
    console.log(`📊 Veritabanında kalan toplam gerçek yorum sayısı: ${remaining}`);

    process.exit(0);
  } catch (err) {
    console.error("Hata:", err);
    process.exit(1);
  }
}

removeFakeReviews();
