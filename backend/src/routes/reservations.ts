import { Router } from 'express';
import { ReservationController } from '../controllers/reservationController';

const router = Router();
const controller = new ReservationController();

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

export default router;