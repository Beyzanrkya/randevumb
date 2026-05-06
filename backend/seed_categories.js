const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');

const categories = [
  { name: "Güzellik & Bakım" },
  { name: "Sağlık & Diyet" },
  { name: "Spor & Fitness" },
  { name: "Eğitim & Kurs" },
  { name: "Otomobil & Servis" },
  { name: "Ev & Temizlik" },
  { name: "Psikoloji & Danışmanlık" },
  { name: "Eğlence & Etkinlik" }
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB bağlantısı başarılı.");

    // Mevcutları temizle (isteğe bağlı, ama temiz bir başlangıç iyidir)
    await Category.deleteMany({});
    
    const created = await Category.insertMany(categories);
    console.log(`${created.length} adet kategori başarıyla eklendi.`);
    
    process.exit(0);
  } catch (error) {
    console.error("Hata:", error);
    process.exit(1);
  }
}

seedCategories();
