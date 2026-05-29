import { Router } from 'express';
import { PriceController } from '../controllers/priceController';

const router = Router();
const controller = new PriceController();

// AJOUTEZ CES DEUX LIGNES POUR RÉGLER LA 404
router.get('/base-price', controller.getBasePrice);
router.put('/base-price', controller.updateBasePrice);

// VOS ROUTES EXISTANTES
router.get('/prices/range', controller.getPricesByRange);
router.get('/prices', controller.getAllPrices);
router.put('/custom-price', controller.updateCustomPrice);
router.delete('/custom-price/:date', controller.deleteCustomPrice);

export default router;