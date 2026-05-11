import { Router } from 'express';
import { ReservationController } from '../controllers/reservationController';
//import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new ReservationController();

// Public
router.post('/', (req, res) => controller.createReservation(req, res));
router.get('/availability', (req, res) => controller.checkAvailability(req, res));

// Admin only
//router.get('/', authMiddleware, (req, res) => controller.getReservations(req, res));
//router.put('/:id/status', authMiddleware, (req, res) => controller.updateReservationStatus(req, res));

export default router;