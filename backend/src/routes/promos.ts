import { Router } from 'express';
import { PromoController } from '../controllers/promoController';

const router = Router();
const controller = new PromoController();

// ── Admin (protégées) ──────────────────────────────────────────
router.get('/',        controller.getAll);    // Liste tous les codes
router.post('/',       controller.create);    // Créer un code
router.delete('/:id',  controller.remove);    // Supprimer un code

// ── Client (publiques) ─────────────────────────────────────────
router.post('/validate', controller.validate);    // Vérifier un code (formulaire réservation)
router.post('/apply',    controller.applyUsage);  // Incrémenter après réservation

export default router;