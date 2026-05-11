import { Router } from 'express';
import { AvailabilityController } from '../controllers/availabilityController';

const router = Router();
const controller = new AvailabilityController();

// Obtenir le calendrier complet (utilisé par ton composant AvailabilityCalendar)
router.get('/calendar', controller.getMonthCalendar);

// Obtenir uniquement la liste des dates occupées
router.get('/reserved', controller.getReservedDates);

// Vérifier une plage spécifique
router.get('/check', controller.checkDateRange);

// Calculer le prix
router.get('/price', controller.calculatePrice);

export default router;