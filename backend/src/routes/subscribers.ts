import { Router } from 'express';
import { SubscriberController } from '../controllers/subscriberController';

const router = Router();
const controller = new SubscriberController();

// Public
router.post('/', controller.subscribe);         // S'abonner depuis le site

// Admin
router.get('/',           controller.getAll);   // Liste dans l'admin
router.get('/export',     controller.export);   // Export CSV
router.delete('/:id',     controller.remove);   // Supprimer

export default router;