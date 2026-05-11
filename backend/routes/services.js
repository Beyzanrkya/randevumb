const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const authMiddleware = require("../middleware/auth");

// Senin gereksinimlerin
router.post("/", serviceController.createService); // Madde 7 (Auth geçici kaldırıldı)
router.get("/", serviceController.getServicesByBusiness); // Madde 8
router.put("/:serviceId", serviceController.updateService); // Madde 9 (Auth geçici kaldırıldı)

module.exports = router;