import { Request, Response } from 'express';
import { Reservation as ReservationModel } from '../models/Reservation';
import { EmailService } from '../services/emailService';
import { Op, fn, col, Sequelize } from 'sequelize'; // Correction : Import de Sequelize ici

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
    this.getClients = this.getClients.bind(this);
    this.getDashboardStats = this.getDashboardStats.bind(this); // Ajout du bind manquant
  }

  /**
   * POST - Créer une nouvelle réservation
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

  async getClients(req: Request, res: Response) {
    try {
      const clients = await ReservationModel.findAll({
        attributes: [
          'email',
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
      console.error("ERREUR SQL CLIENTS :", error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateReservation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const reservation = await ReservationModel.findByPk(id);
      if (!reservation) return res.status(404).json({ success: false, error: 'Non trouvée' });
      
      const oldStatus = reservation.status;
      if (updateData.checkInDate || updateData.checkOutDate) {
        const nights = this.calculateNights(
          updateData.checkInDate || reservation.checkInDate,
          updateData.checkOutDate || reservation.checkOutDate
        );
        if (nights > 0) {
          const p = parseFloat(process.env.PROPERTY_PRICE_PER_NIGHT || '150');
          updateData.totalPrice = nights * p;
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

  /**
   * GET - Statistiques globales pour le Dashboard (Admin)
   */
  async getDashboardStats(req: Request, res: Response) {
    try {
      // 1. Calcul des revenus et nuits par mois
      const monthlyData = await ReservationModel.findAll({
        attributes: [
          [fn('MONTH', col('checkInDate')), 'month'],
          [fn('SUM', col('totalPrice')), 'revenue'],
          // Utilisation d'un literal SQL pour calculer la différence de jours
          [Sequelize.literal('SUM(DATEDIFF(checkOutDate, checkInDate))'), 'nights']
        ],
        where: { status: 'confirmed' },
        group: [fn('MONTH', col('checkInDate'))],
        order: [[fn('MONTH', col('checkInDate')), 'ASC']],
        raw: true
      });

      // 2. Répartition par source
      const sourcesData = await ReservationModel.findAll({
        attributes: [
          'source',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['source'],
        raw: true
      });

      // 3. Totaux
      const totalRevenue = await ReservationModel.sum('totalPrice', { where: { status: 'confirmed' } });
      const totalClients = await ReservationModel.count({ distinct: true, col: 'email' });
      const upcoming = await ReservationModel.count({ 
        where: { 
          status: 'confirmed', 
          checkInDate: { [Op.gte]: new Date() } 
        } 
      });

      // 4. Formatage
      const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
      const formattedRevenue = monthlyData.map((d: any) => ({
        m: monthNames[d.month - 1] || 'Inconnu',
        revenue: parseFloat(d.revenue) || 0,
        nights: parseInt(d.nights) || 0
      }));

      const formattedSources = sourcesData.map((s: any) => ({
        name: s.source.charAt(0).toUpperCase() + s.source.slice(1),
        value: parseInt(s.count) || 0
      }));

      return res.json({
        success: true,
        data: {
          revenue: formattedRevenue.length > 0 ? formattedRevenue : [{ m: 'Aucun', revenue: 0, nights: 0 }],
          sources: formattedSources.length > 0 ? formattedSources : [{ name: 'Aucune', value: 0 }],
          totals: {
            revenue: totalRevenue || 0,
            clients: totalClients || 0,
            upcoming: upcoming || 0,
            nights: formattedRevenue.reduce((acc, curr) => acc + curr.nights, 0)
          }
        }
      });
    } catch (error: any) {
      console.error("Erreur DashboardStats:", error);
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