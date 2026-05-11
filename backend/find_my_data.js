const mongoose = require('mongoose');
const Business = require('./models/Business');
const BusinessOwner = require('./models/BusinessOwner');
require('dotenv').config();

async function findUserBusinesses() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log("--- TÜM İŞLETME SAHİPLERİ ---");
        const owners = await BusinessOwner.find();
        owners.forEach(o => console.log(`ID: ${o._id}, Ad: ${o.name}, Email: ${o.email}`));

        console.log("\n--- TÜM İŞLETMELER ---");
        const businesses = await Business.find();
        businesses.forEach(b => console.log(`ID: ${b._id}, Ad: ${b.name}, OwnerID: ${b.ownerId}`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findUserBusinesses();
