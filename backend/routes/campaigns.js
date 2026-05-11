const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');

// Kampanya oluştur
router.post('/', async (req, res) => {
    console.log("[Kampanya] Oluşturma isteği geldi:", req.body);
    try {
        const { businessId, title, description, discountRate, endDate } = req.body;
        const newCampaign = new Campaign({
            businessId,
            title,
            description,
            discountRate,
            endDate
        });
        console.log("[Kampanya] Veritabanına kaydediliyor...");
        await newCampaign.save();
        console.log("[Kampanya] Başarıyla kaydedildi.");
        res.status(201).json(newCampaign);
    } catch (error) {
        console.error("[Kampanya] HATA:", error.message);
        res.status(500).json({ message: "Kampanya oluşturulamadı", error: error.message });
    }
});

// İşletmeye ait kampanyaları getir
router.get('/business/:businessId', async (req, res) => {
    try {
        const campaigns = await Campaign.find({ businessId: req.params.businessId }).sort({ createdAt: -1 });
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ message: "Kampanyalar getirilemedi", error: error.message });
    }
});

// Kampanya güncelle
router.put('/:id', async (req, res) => {
    console.log(`[Kampanya] Güncelleme isteği (ID: ${req.params.id}):`, req.body);
    try {
        const { title, description, discountRate, endDate, isActive } = req.body;
        
        // Sadece gelen alanları güncellemek için bir obje oluşturalım
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (discountRate !== undefined) updateData.discountRate = discountRate;
        if (endDate !== undefined) updateData.endDate = endDate;
        if (isActive !== undefined) updateData.isActive = isActive;

        console.log("[Kampanya] Güncellenecek veriler:", updateData);

        const updated = await Campaign.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) {
            console.log("[Kampanya] Güncellenecek kampanya bulunamadı.");
            return res.status(404).json({ message: "Kampanya bulunamadı" });
        }

        console.log("[Kampanya] Başarıyla güncellendi:", updated._id);
        res.status(200).json(updated);
    } catch (error) {
        console.error("[Kampanya] Güncelleme HATASI:", error.message);
        res.status(500).json({ message: "Kampanya güncellenemedi", error: error.message });
    }
});

module.exports = router;
