// ============================================
// Routes: Disponibilité
// ============================================

import { Router } from 'express';
import { AvailabilityController } from '../controllers/availabilityController';

const router = Router();
const controller = new AvailabilityController();

// GET /api/availability/calendar?year=2024&month=5
// Obtenir le calendrier d'un mois avec disponibilités
router.get('/calendar', (req, res) => controller.getMonthCalendar(req, res));

// GET /api/availability/reserved?year=2024&month=5
// Obtenir les dates réservées d'un mois
router.get('/reserved', (req, res) => controller.getReservedDates(req, res));

// GET /api/availability/check?checkIn=2024-05-10&checkOut=2024-05-15
// Vérifier la disponibilité d'une plage de dates
router.get('/check', (req, res) => controller.checkDateRange(req, res));

// GET /api/availability/price?checkIn=2024-05-10&checkOut=2024-05-15
// Calculer le prix pour une plage de dates
router.get('/price', (req, res) => controller.calculatePrice(req, res));

export default router;