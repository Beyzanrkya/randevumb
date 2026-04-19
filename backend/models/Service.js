const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    businessId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Business", 
        required: true 
    },
    name: { type: String, required: true }, // Hizmet adı
    description: { type: String }, // Hizmet açıklaması
    price: { type: Number, required: true }, // Ücret
    duration: { type: Number, required: true } // Dakika cinsinden süre
});

module.exports = mongoose.model("Service", serviceSchema);