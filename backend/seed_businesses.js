const mongoose = require('mongoose');
const Business = require('./models/Business');
require('dotenv').config();

const testOwnerId = "663cedb9c9f7530d8c83d838"; 

async function seedBusinesses() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Bağlandı...");

        // Mevcutları temizleyelim (isteğe bağlı ama temizlik iyidir)
        // await Business.deleteMany({ ownerId: testOwnerId });

        const businesses = [
            {
                ownerId: testOwnerId,
                name: "MBrandev Güzellik Merkezi",
                category: "Güzellik & Bakım",
                email: "nisantasi@mbrandev.com",
                phone: "0212 222 33 44",
                address: "Nişantaşı, İstanbul",
                description: "Profesyonel cilt bakımı ve güzellik hizmetleri.",
                imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
                averageRating: 4.9,
                reviewCount: 124
            },
            {
                ownerId: testOwnerId,
                name: "MBrandev VIP Barber",
                category: "Güzellik & Bakım",
                email: "besiktas@mbrandev.com",
                phone: "0212 555 66 77",
                address: "Beşiktaş, İstanbul",
                description: "Erkekler için özel saç kesim ve sakal tasarımı.",
                imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
                averageRating: 4.8,
                reviewCount: 89
            },
            {
                ownerId: testOwnerId,
                name: "MBrandev Spa & Wellness",
                category: "Sağlık & Diyet",
                email: "kadikoy@mbrandev.com",
                phone: "0216 333 44 55",
                address: "Kadıköy, İstanbul",
                description: "Huzur dolu bir atmosferde masaj ve terapi keyfi.",
                imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
                averageRating: 5.0,
                reviewCount: 56
            }
        ];

        await Business.insertMany(businesses);
        console.log("3 İşletme başarıyla eklendi! ✅");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedBusinesses();
