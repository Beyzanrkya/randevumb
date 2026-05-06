const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

const BusinessOwner = require('./backend/models/BusinessOwner');
const Business = require('./backend/models/Business');

const businessesData = [
  { name: "Yıldız Güzellik Salonu", email: "yildiz@mbrandev.com" },
  { name: "Modern Berber", email: "berber@mbrandev.com" },
  { name: "Sağlık Diş Kliniği", email: "dis@mbrandev.com" },
  { name: "Dost Patiler Veteriner", email: "veteriner@mbrandev.com" },
  { name: "Zihin Psikoloji", email: "psikoloji@mbrandev.com" },
  { name: "Form Pilates", email: "pilates@mbrandev.com" },
  { name: "Huzur Spa & Masaj", email: "spa@mbrandev.com" },
  { name: "Lazer Estetik Merkezi", email: "estetik@mbrandev.com" },
  { name: "Fit Yaşam Diyetisyen", email: "diyet@mbrandev.com" },
  { name: "Zen Yoga Stüdyosu", email: "yoga@mbrandev.com" }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for seeding...");

    const passwordHash = await bcrypt.hash("sifre123", 10);

    for (const item of businessesData) {
      // Check if owner already exists
      let owner = await BusinessOwner.findOne({ email: item.email });

      if (!owner) {
        owner = await BusinessOwner.create({
          name: item.name + " Sahibi",
          email: item.email,
          password: passwordHash
        });
        console.log(`Created owner: ${item.email}`);
      }

      // Check if business already exists
      let business = await Business.findOne({ email: item.email });
      if (!business) {
        await Business.create({
          ownerId: owner._id,
          name: item.name,
          email: item.email,
          phone: "0555 555 55 55",
          address: "İstanbul/Türkiye",
          description: `${item.name} olarak kaliteli hizmet vermekteyiz.`,
          imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=500"
        });
        console.log(`Created business: ${item.name}`);
      }
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seed();
