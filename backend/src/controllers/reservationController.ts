import { Request, Response } from 'express';
import { Reservation } from '../models/Reservation';
import { EmailService } from '../services/emailService';
import { Op } from 'sequelize';

const emailService = new EmailService();

export class ReservationController {
  
  // POST - Créer une nouvelle réservation (depuis le formulaire contact)
  async createReservation(req: Request, res: Response) {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        nationality,
        numberOfGuests,
        checkInDate,
        checkOutDate,
        specialRequests,
      } = req.body;

      // Vérifier la disponibilité
      const existingReservation = await Reservation.findOne({
        where: {
          status: { [Op.in]: ['confirmed', 'pending'] },
          [Op.or]: [
            {
              checkInDate: { [Op.between]: [checkInDate, checkOutDate] },
            },
            {
              checkOutDate: { [Op.between]: [checkInDate, checkOutDate] },
            },
          ],
        },
      });

      if (existingReservation) {
        return res.status(400).json({
          success: false,
          error: 'Dates non disponibles',
        });
      }

      // Calculer le prix total
      const nights = this.calculateNights(checkInDate, checkOutDate);
      const pricePerNight = parseFloat(process.env.PROPERTY_PRICE_PER_NIGHT || '150');
      const totalPrice = nights * pricePerNight;

      // Générer une référence unique
      const refNumber = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const reservation = await Reservation.create({
        refNumber,
        firstName,
        lastName,
        email,
        phone,
        nationality,
        numberOfGuests,
        checkInDate,
        checkOutDate,
        totalPrice,
        specialRequests,
        source: 'direct',
        status: 'pending',
      });

      // Envoyer email de confirmation
      await emailService.sendConfirmationEmail(reservation);

      res.status(201).json({
        success: true,
        data: reservation,
        message: 'Réservation créée. Vérifiez votre email.',
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET - Lister les réservations (Admin)
  async getReservations(req: Request, res: Response) {
    try {
      const { status, source, month } = req.query;
      const where: any = {};

      if (status && status !== 'all') where.status = status;
      if (source) where.source = source;

      if (month) {
        const [year, monthNum] = (month as string).split('-');
        where.createdAt = {
          [Op.between]: [
            new Date(parseInt(year), parseInt(monthNum) - 1, 1),
            new Date(parseInt(year), parseInt(monthNum), 0),
          ],
        };
      }

      const reservations = await Reservation.findAll({
        where,
        order: [['checkInDate', 'DESC']],
      });

      res.json({ success: true, data: reservations });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT - Mettre à jour le statut (Admin)
  async updateReservationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const reservation = await Reservation.findByPk(id);
      if (!reservation) {
        return res.status(404).json({ success: false, error: 'Réservation non trouvée' });
      }

      const oldStatus = reservation.status;
      await reservation.update({ status });

      // Envoyer email si annulation
      if (oldStatus !== 'cancelled' && status === 'cancelled') {
        await emailService.sendCancellationEmail(reservation);
      }

      res.json({ success: true, data: reservation });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET - Disponibilité des dates
  async checkAvailability(req: Request, res: Response) {
    try {
      const { checkIn, checkOut } = req.query;

      const reservation = await Reservation.findOne({
        where: {
          status: { [Op.in]: ['confirmed', 'pending'] },
          [Op.or]: [
            { checkInDate: { [Op.between]: [checkIn, checkOut] } },
            { checkOutDate: { [Op.between]: [checkIn, checkOut] } },
          ],
        },
      });

      res.json({ available: !reservation });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / msPerDay);
  }
}