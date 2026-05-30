"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservationController_1 = require("../controllers/reservationController");
const router = (0, express_1.Router)();
const controller = new reservationController_1.ReservationController();
/**
 * URL de base: /api/reservations
 */
// --- ROUTES PUBLIQUES (Client) ---
// Créer une réservation depuis le formulaire
router.post('/', controller.createReservation);
// Vérifier une plage de dates (Disponibilité calendrier)
router.get('/availability', controller.checkAvailability);
// --- ROUTES ADMIN (Dashboard) ---
// Lister les clients uniques et leurs statistiques (Carnet)
// IMPORTANT : Placer cette route AVANT les routes avec :id
router.get('/clients-list', controller.getClients);
// Lister toutes les réservations (avec filtres optionnels)
router.get('/', controller.getReservations);
// Modifier COMPLÈTEMENT une réservation (Dates, Nom, Personnes, Prix...)
router.put('/:id', controller.updateReservation);
// Modifier uniquement le STATUT (Confirmer/Annuler)
router.put('/:id/status', controller.updateReservationStatus);
// Ajoutez ces deux lignes
router.get('/admin/stats', controller.getDashboardStats);
exports.default = router;
