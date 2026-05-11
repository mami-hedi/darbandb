import { Op } from 'sequelize';
import { Reservation } from '../models/Reservation';

export class ReservationService {
  /**
   * Vérifie si une plage de dates est libre de toute réservation
   */
  async checkAvailability(checkIn: string, checkOut: string): Promise<boolean> {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Sécurité : checkIn doit être avant checkOut
    if (checkInDate >= checkOutDate) {
      throw new Error("La date de départ doit être après la date d'arrivée.");
    }

    const conflict = await Reservation.findOne({
      where: {
        status: { [Op.in]: ['pending', 'confirmed'] },
        // Logique de chevauchement : (StartA < EndB) AND (EndA > StartB)
        [Op.and]: [
          { checkInDate: { [Op.lt]: checkOutDate } },
          { checkOutDate: { [Op.gt]: checkInDate } }
        ]
      }
    });

    return !conflict;
  }

  /**
   * Calcule le montant total
   */
  calculatePrice(checkIn: string, checkOut: string, rate: number): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return nights > 0 ? nights * rate : 0;
  }
}