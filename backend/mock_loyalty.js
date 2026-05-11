const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Loyalty = require('./models/Loyalty');

async function mockLoyaltyPoints() {
  try {
    console.log("Veritabanına bağlanılıyor...");
    await mongoose.connect(process.env.MONGODB_URI);

    const businessId = "69f754fa8c83d83891093218"; // Fit Yaşam Diyetisyen
    const customerId = "69f754fa8c83d83891093210"; // Test Müşteri

    const result = await Loyalty.findOneAndUpdate(
      { customerId, businessId },
      { $set: { points: 40, updatedAt: Date.now() } },
      { upsert: true, new: true }
    );
    
    console.log(`✅ Sadakat kartına 40 puan (4 pul) işlendi.`);
    process.exit(0);
  } catch (err) {
    console.error("Hata:", err);
    process.exit(1);
  }
}

mockLoyaltyPoints();
