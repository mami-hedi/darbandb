"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservationController_1 = require("../controllers/reservationController");
const router = (0, express_1.Router)();
const controller = new reservationController_1.ReservationController();
/**
 * URL de base: /api/reservations
 */
// ─────────────────────────────────────────────────────────────
// ROUTES PUBLIQUES (Client)
// ─────────────────────────────────────────────────────────────
// Créer une réservation depuis le formulaire
router.post('/', controller.createReservation);
// Vérifier la disponibilité d'une plage de dates
// IMPORTANT : avant /:id pour éviter la collision
router.get('/availability', controller.checkAvailability);
// Aperçu du prix nuit par nuit avant réservation
// IMPORTANT : avant /:id pour éviter la collision
router.get('/price-preview', controller.getPricePreview);
// ─────────────────────────────────────────────────────────────
// ROUTES ADMIN (Dashboard)
// ─────────────────────────────────────────────────────────────
// Statistiques du dashboard
// IMPORTANT : avant /:id pour éviter la collision
router.get('/admin/stats', controller.getDashboardStats);
// Liste des clients uniques et leurs statistiques (Carnet)
// IMPORTANT : avant /:id pour éviter la collision
router.get('/clients-list', controller.getClients);
// Lister toutes les réservations (avec filtres optionnels ?status=&month=)
router.get('/', controller.getReservations);
// Modifier COMPLÈTEMENT une réservation (dates, nom, personnes, prix…)
router.put('/:id', controller.updateReservation);
// Modifier uniquement le STATUT (confirmer / annuler)
router.patch('/:id/status', controller.updateReservationStatus);
// Modifier l'acompte (montant, statut payé, notes)
router.patch('/:id/deposit', controller.updateDeposit);
// Sauvegarder l'inspection checkout — NEW
router.patch('/:id/inspection', controller.saveInspection);
exports.default = router;
