const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Review = require('./models/Review');
const Business = require('./models/Business');

async function seedReviews() {
  try {
    console.log("Veritabanına bağlanılıyor...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Bağlantı başarılı.\n");

    const businessId = "69f754fa8c83d83891093218"; // Fit Yaşam Diyetisyen ID
    const customerId = "69f754fa8c83d83891093210"; // Test Müşteri ID

    const reviews = [
      {
        businessId,
        customerId,
        rating: 5,
        comment: "Harika bir diyetisyen! 2 ayda 8 kilo verdim ve hiç aç kalmadım. Kesinlikle tavsiye ediyorum.",
        appointmentId: new mongoose.Types.ObjectId()
      },
      {
        businessId,
        customerId,
        rating: 4,
        comment: "Ofisleri çok merkezi bir yerde. İlgileri için teşekkürler. Sadece bazen randevu saatinde ufak sarkmalar olabiliyor.",
        appointmentId: new mongoose.Types.ObjectId()
      },
      {
        businessId,
        customerId,
        rating: 5,
        comment: "Kişiye özel programları gerçekten işe yarıyor. Güler yüzlü hizmet!",
        appointmentId: new mongoose.Types.ObjectId()
      }
    ];

    await Review.deleteMany({ businessId });
    const saved = await Review.insertMany(reviews);
    
    // İşletme puanını güncelle
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Business.findByIdAndUpdate(businessId, {
      averageRating: avg.toFixed(1),
      reviewCount: reviews.length
    });

    console.log(`✅ ${saved.length} adet yorum ve güncel puan veritabanına işlendi.`);
    process.exit(0);
  } catch (err) {
    console.error("Hata:", err);
    process.exit(1);
  }
}

seedReviews();
