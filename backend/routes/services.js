const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const authMiddleware = require("../middleware/auth");

// Senin gereksinimlerin
router.post("/", authMiddleware, serviceController.createService); // Madde 7
router.get("/", serviceController.getServicesByBusiness); // Madde 8
router.put("/:serviceId", authMiddleware, serviceController.updateService); // Madde 9

module.exports = router;