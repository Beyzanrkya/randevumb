const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function repair() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Veritabanına bağlanıldı...");

    const db = mongoose.connection.db;
    const reviews = await db.collection('reviews').find().toArray();
    
    console.log(`${reviews.length} adet yorum inceleniyor...`);
    let count = 0;

    for (let r of reviews) {
      console.log(`Yorum ID: ${r._id}, businessId tipi: ${typeof r.businessId}, Değer: ${r.businessId}`);
      if (typeof r.businessId === 'string' || r.businessId instanceof String) {
        await db.collection('reviews').updateOne(
          { _id: r._id },
          { $set: { businessId: new mongoose.Types.ObjectId(r.businessId) } }
        );
        count++;
      }
    }

    console.log(`${count} adet yorumun ID formatı başarıyla düzeltildi!`);
    process.exit(0);
  } catch (err) {
    console.error("Hata:", err);
    process.exit(1);
  }
}

repair();
