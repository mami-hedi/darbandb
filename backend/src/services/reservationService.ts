import { Op } from 'sequelize';
import { Reservation } from '../models/Reservation';

export class ReservationService {
  async checkAvailability(checkIn: string, checkOut: string): Promise<boolean> {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const conflict = await Reservation.findOne({
      where: {
        status: { [Op.in]: ['pending', 'confirmed'] },
        [Op.or]: [
          {
            checkInDate: { [Op.lt]: checkOutDate },
            checkOutDate: { [Op.gt]: checkInDate },
          }
        ]
      }
    });
    return !conflict;
  }

  calculatePrice(checkIn: string, checkOut: string, rate: number): number {
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights * rate;
  }
}