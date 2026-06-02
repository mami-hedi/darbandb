"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const availabilityController_1 = require("../controllers/availabilityController");
const router = (0, express_1.Router)();
const controller = new availabilityController_1.AvailabilityController();
// Obtenir le calendrier complet (utilisé par ton composant AvailabilityCalendar)
router.get('/calendar', controller.getMonthCalendar);
// Obtenir uniquement la liste des dates occupées
router.get('/reserved', controller.getReservedDates);
// Vérifier une plage spécifique
router.get('/check', controller.checkDateRange);
// Calculer le prix
router.get('/price', controller.calculatePrice);
// Route pour GET /api/availability/blocks
router.get('/blocks', controller.getManualBlocks);
// Route pour POST /api/availability/toggle (déjà utilisée par votre frontend)
router.post('/toggle', controller.toggleBlock);
exports.default = router;
