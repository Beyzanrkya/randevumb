const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    discountRate: { type: Number }, // Yüzde kaç indirim?
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);
