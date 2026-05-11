import { Request, Response } from 'express';
import { Reservation as ReservationModel } from '../models/Reservation';
import { EmailService } from '../services/emailService';
import { Op, fn, col } from 'sequelize';

export class ReservationController {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
    // Bindings
    this.createReservation = this.createReservation.bind(this);
    this.getReservations = this.getReservations.bind(this);
    this.updateReservation = this.updateReservation.bind(this);
    this.updateReservationStatus = this.updateReservationStatus.bind(this);
    this.checkAvailability = this.checkAvailability.bind(this);
    this.getClients = this.getClients.bind(this); // Nouveau bind
  }

  /**
   * POST - Créer une nouvelle réservation (Côté Client)
   */
  async createReservation(req: Request, res: Response) {
    try {
      const {
        firstName, lastName, email, phone, 
        numberOfGuests, checkInDate, checkOutDate, specialRequests,
      } = req.body;

      const existingReservation = await ReservationModel.findOne({
        where: {
          status: { [Op.in]: ['confirmed', 'pending'] },
          [Op.and]: [
            { checkInDate: { [Op.lt]: checkOutDate } },
            { checkOutDate: { [Op.gt]: checkInDate } }
          ]
        },
      });

      if (existingReservation) {
        return res.status(400).json({
          success: false,
          error: 'Ces dates sont déjà réservées ou en attente.',
        });
      }

      const nights = this.calculateNights(checkInDate, checkOutDate);
      if (nights <= 0) {
        return res.status(400).json({ success: false, error: 'Dates invalides.' });
      }

      const pricePerNight = parseFloat(process.env.PROPERTY_PRICE_PER_NIGHT || '150');
      const totalPrice = nights * pricePerNight;
      const refNumber = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const reservation = await ReservationModel.create({
        refNumber,
        firstName,
        lastName,
        email,
        phone,
        numberOfGuests: parseInt(numberOfGuests) || 2,
        checkInDate,
        checkOutDate,
        totalPrice,
        specialRequests,
        source: 'direct',
        status: 'pending',
      });

      try {
        await this.emailService.sendConfirmationEmail(reservation);
      } catch (emailErr) {
        console.error("Email de confirmation non envoyé:", emailErr);
      }

      return res.status(201).json({
        success: true,
        data: reservation,
        message: 'Réservation créée avec succès.',
      });
    } catch (error: any) {
      console.error("Erreur Controller (Create):", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET - Lister les réservations (Admin)
   */
  async getReservations(req: Request, res: Response) {
    try {
      const { status, month } = req.query;
      const where: any = {};

      if (status && status !== 'all') where.status = status;

      if (month) {
        const [year, m] = (month as string).split('-');
        where.checkInDate = {
          [Op.between]: [new Date(+year, +m - 1, 1), new Date(+year, +m, 0)],
        };
      }

      const reservations = await ReservationModel.findAll({
        where,
        order: [['checkInDate', 'DESC']],
      });

      return res.json({ success: true, data: reservations });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

 /**
   * GET - Liste des clients uniques avec stats (Admin)
   */
  async getClients(req: Request, res: Response) {
    try {
      const clients = await ReservationModel.findAll({
        attributes: [
          'email',
          // Utilisation de MAX ou MIN pour satisfaire MySQL sans changer le GROUP BY principal
          [fn('MAX', col('firstName')), 'firstName'],
          [fn('MAX', col('lastName')), 'lastName'],
          [fn('MAX', col('phone')), 'phone'],
          [fn('COUNT', col('id')), 'stays'],
          [fn('SUM', col('totalPrice')), 'totalSpent'],
        ],
        group: ['email'], 
        order: [[fn('SUM', col('totalPrice')), 'DESC']],
        raw: true 
      });

      return res.json({ success: true, data: clients });
    } catch (error: any) {
      // Regardez bien ce log dans votre terminal VS Code / Node
      console.error("ERREUR SQL CRITIQUE :", error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * PUT - Mise à jour d'une réservation (Admin)
   */
  async updateReservation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const reservation = await ReservationModel.findByPk(id);
      if (!reservation) {
        return res.status(404).json({ success: false, error: 'Réservation non trouvée' });
      }

      const oldStatus = reservation.status;

      if (updateData.checkInDate || updateData.checkOutDate) {
        const checkIn = updateData.checkInDate || reservation.checkInDate;
        const checkOut = updateData.checkOutDate || reservation.checkOutDate;
        const nights = this.calculateNights(checkIn as string, checkOut as string);
        
        if (nights > 0) {
          const pricePerNight = parseFloat(process.env.PROPERTY_PRICE_PER_NIGHT || '150');
          updateData.totalPrice = nights * pricePerNight;
        }
      }

      await reservation.update(updateData);

      if (updateData.status && oldStatus !== 'cancelled' && updateData.status === 'cancelled') {
        await this.emailService.sendCancellationEmail(reservation);
      }

      return res.json({ success: true, data: reservation });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * PUT - Mise à jour du statut uniquement (Admin)
   */
  async updateReservationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const reservation = await ReservationModel.findByPk(id);
      if (!reservation) return res.status(404).json({ success: false });

      const oldStatus = reservation.status;
      await reservation.update({ status });

      if (oldStatus !== 'cancelled' && status === 'cancelled') {
        await this.emailService.sendCancellationEmail(reservation);
      }
      return res.json({ success: true, data: reservation });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET - Disponibilité
   */
  async checkAvailability(req: Request, res: Response) {
    try {
      const { checkIn, checkOut } = req.query;
      const conflict = await ReservationModel.findOne({
        where: {
          status: { [Op.in]: ['confirmed', 'pending'] },
          [Op.and]: [
            { checkInDate: { [Op.lt]: checkOut as string } },
            { checkOutDate: { [Op.gt]: checkIn as string } }
          ]
        },
      });
      return res.json({ available: !conflict });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}