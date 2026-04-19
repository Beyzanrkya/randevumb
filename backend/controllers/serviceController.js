const Service = require("../models/Service");

// 7. Hizmet Ekleme
exports.createService = async (req, res) => {
    try {
        const newService = new Service(req.body); //
        await newService.save();
        res.status(201).json(newService);
    } catch (err) {
        res.status(400).json({ message: "Hizmet eklenemedi" });
    }
};

// 8. Hizmet Listeleme (İşletme bazlı filtreleme ile)
exports.getServicesByBusiness = async (req, res) => {
    try {
        // Query param'dan gelen businessId'ye göre listeleme
        const services = await Service.find({ businessId: req.query.businessId });
        res.status(200).json(services);
    } catch (err) {
        res.status(500).json({ message: "Listeleme hatası" });
    }
};

// 9. Hizmet Güncelleme
exports.updateService = async (req, res) => {
    try {
        const updated = await Service.findByIdAndUpdate(
            req.params.serviceId, //
            req.body, 
            { new: true }
        );
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ message: "Güncelleme hatası" });
    }
};