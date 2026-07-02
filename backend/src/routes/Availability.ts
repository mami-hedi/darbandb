import { Router } from 'express';
import { AvailabilityController } from '../controllers/availabilityController';

const router = Router();
const controller = new AvailabilityController();

// Obtenir le calendrier complet (utilisé par AvailabilityCalendar — 3 zones)
router.get('/calendar', controller.getMonthCalendar);

// Obtenir uniquement la liste des dates occupées (réservations directes)
router.get('/reserved', controller.getReservedDates);

// Vérifier une plage spécifique
router.get('/check', controller.checkDateRange);

// Calculer le prix
router.get('/price', controller.calculatePrice);

// Blocages manuels (admin)
router.get('/blocks', controller.getManualBlocks);
router.post('/toggle', controller.toggleBlock);

// Blocages Airbnb (sync iCal)
router.get('/airbnb-blocks', controller.getAirbnbBlocks);
router.post('/airbnb-sync', controller.triggerAirbnbSync);

export default router;