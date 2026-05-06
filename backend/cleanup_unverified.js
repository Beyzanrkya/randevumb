const mongoose = require('mongoose');
require('dotenv').config();
const Customer = require('./models/Customer');
const BusinessOwner = require('./models/BusinessOwner');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const filter = { isVerified: { $ne: true } };
    const delC = await Customer.deleteMany(filter);
    const delO = await BusinessOwner.deleteMany(filter);
    console.log(`${delC.deletedCount} adet musteri silindi.`);
    console.log(`${delO.deletedCount} adet isletme sahibi silindi.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

cleanup();
