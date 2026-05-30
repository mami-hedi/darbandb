"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const priceController_1 = require("../controllers/priceController");
const router = (0, express_1.Router)();
const controller = new priceController_1.PriceController();
// AJOUTEZ CES DEUX LIGNES POUR RÉGLER LA 404
router.get('/base-price', controller.getBasePrice);
router.put('/base-price', controller.updateBasePrice);
// VOS ROUTES EXISTANTES
router.get('/prices/range', controller.getPricesByRange);
router.get('/prices', controller.getAllPrices);
router.put('/custom-price', controller.updateCustomPrice);
router.delete('/custom-price/:date', controller.deleteCustomPrice);
exports.default = router;
