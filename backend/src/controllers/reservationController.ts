import { Request, Response } from 'express';
import { Reservation as ReservationModel } from '../models/Reservation';
import { EmailService } from '../services/emailService';
import { Op, fn, col, Sequelize } from 'sequelize';
import { CustomPrice } from '../models/CustomPrice';
import { notifier } from '../services/sseService';
// import { notifyNewReservation, notifyCancellation } from '../services/whatsappservice';

export class ReservationController {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
    this.createReservation       = this.createReservation.bind(this);
    this.getReservations         = this.getReservations.bind(this);
    this.updateReservation       = this.updateReservation.bind(this);
    this.updateReservationStatus = this.updateReservationStatus.bind(this);
    this.updateDeposit           = this.updateDeposit.bind(this);
    this.checkAvailability       = this.checkAvailability.bind(this);
    this.getClients              = this.getClients.bind(this);
    this.getDashboardStats       = this.getDashboardStats.bind(this);
    this.getPricePreview         = this.getPricePreview.bind(this);
    this.saveInspection          = this.saveInspection.bind(this);
  }

  // ─────────────────────────────────────────────────────────────
  // POST /reservations  — créer une réservation
  // ─────────────────────────────────────────────────────────────
  async createReservation(req: Request, res: Response) {
  try {
    const {
      firstName, lastName, email, phone,
      numberOfGuests, checkInDate, checkOutDate,
      specialRequests, depositAmount,
    } = req.body;
 
    const conflict = await ReservationModel.findOne({
      where: {
        status: { [Op.in]: ['confirmed', 'pending'] },
        [Op.and]: [
          { checkInDate:  { [Op.lt]: checkOutDate } },
          { checkOutDate: { [Op.gt]: checkInDate  } },
        ],
      },
    });
    if (conflict) {
      return res.status(400).json({
        success: false,
        error: 'Ces dates sont déjà réservées ou en attente.',
      });
    }
 
    const nights = this.calculateNights(checkInDate, checkOutDate);
    if (nights <= 0) {
      return res.status(400).json({ success: false, error: 'Dates invalides.' });
    }
 
    const totalPrice = await this.calculateTotalPrice(checkInDate, checkOutDate);
    const deposit = depositAmount != null
      ? parseFloat(depositAmount)
      : Math.round(totalPrice * 0.3 * 100) / 100;
 
    const refNumber = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
 
    const reservation = await ReservationModel.create({
      refNumber,
      firstName, lastName, email, phone,
      numberOfGuests: parseInt(numberOfGuests) || 2,
      checkInDate, checkOutDate,
      totalPrice,
      specialRequests,
      source: 'direct',
      status: 'pending',
      depositAmount: deposit,
      depositPaid: false,
      depositPaidAt: null,
      depositNotes: null,
      inspection: null,
    });
 
    res.status(201).json({ success: true, data: reservation });
    notifier.emit('new-reservation', {
  id:        reservation.id,
  guestName: `${reservation.firstName} ${reservation.lastName}`,
  checkIn:   reservation.checkInDate,
  checkOut:  reservation.checkOutDate,
  guests:    reservation.numberOfGuests,
  status:    'En attente',
});
 
    this.emailService.sendConfirmationEmail(reservation)
      .catch((e: any) => console.error('[Email] non envoyé :', e.message));
 
    // notifyNewReservation(reservation)
    //   .catch((e: any) => console.error('[WA] createReservation :', e.message));
 
  } catch (error: any) {
    console.error('Erreur createReservation:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

  // ─────────────────────────────────────────────────────────────
  // GET /reservations
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // GET /reservations/price-preview?checkIn=&checkOut=
  // ─────────────────────────────────────────────────────────────
  async getPricePreview(req: Request, res: Response) {
    try {
      const { checkIn, checkOut } = req.query as { checkIn: string; checkOut: string };
      if (!checkIn || !checkOut) {
        return res.status(400).json({ success: false, error: 'Dates manquantes.' });
      }
      const nights = this.calculateNights(checkIn, checkOut);
      if (nights <= 0) {
        return res.status(400).json({ success: false, error: 'Dates invalides.' });
      }

      const basePrice = parseFloat(process.env.PROPERTY_PRICE_PER_NIGHT || '150');
      const customPrices = await CustomPrice.findAll({
        where: { specificDate: { [Op.between]: [checkIn, checkOut] } },
      });
      const priceMap: Record<string, number> = {};
      customPrices.forEach(cp => { priceMap[cp.specificDate] = parseFloat(cp.price as any); });

      const breakdown: { date: string; price: number; isCustom: boolean }[] = [];
      let total = 0;
      const cursor = new Date(checkIn);
      const end    = new Date(checkOut);
      while (cursor < end) {
        const ds    = cursor.toISOString().split('T')[0];
        const price = priceMap[ds] !== undefined ? priceMap[ds] : basePrice;
        breakdown.push({ date: ds, price, isCustom: priceMap[ds] !== undefined });
        total += price;
        cursor.setDate(cursor.getDate() + 1);
      }

      return res.json({
        success: true,
        data: {
          nights,
          total: Math.round(total * 100) / 100,
          suggestedDeposit: Math.round(total * 0.3 * 100) / 100,
          breakdown,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PUT /reservations/:id  — modifier une réservation
  // ─────────────────────────────────────────────────────────────
  async updateReservation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const reservation = await ReservationModel.findByPk(id);
    if (!reservation) return res.status(404).json({ success: false, error: 'Non trouvée' });
 
    const oldStatus = reservation.status;
 
    if (updateData.checkInDate || updateData.checkOutDate) {
      const nights = this.calculateNights(
        updateData.checkInDate  || reservation.checkInDate,
        updateData.checkOutDate || reservation.checkOutDate,
      );
      if (nights > 0) {
        updateData.totalPrice = await this.calculateTotalPrice(
          updateData.checkInDate  || reservation.checkInDate,
          updateData.checkOutDate || reservation.checkOutDate,
        );
        if (updateData.depositAmount == null) {
          updateData.depositAmount = Math.round(updateData.totalPrice * 0.3 * 100) / 100;
        }
      }
    }
 
    await reservation.update(updateData);
 
    if (updateData.status && oldStatus !== 'cancelled' && updateData.status === 'cancelled') {
      this.emailService.sendCancellationEmail(reservation)
        .catch((e: any) => console.error('[Email] annulation :', e.message));
 
      // notifyCancellation(reservation)
      //   .catch((e: any) => console.error('[WA] annulation :', e.message));
    }
 
    return res.json({ success: true, data: reservation });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

  // ─────────────────────────────────────────────────────────────
  // PATCH /reservations/:id/status
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // PATCH /reservations/:id/deposit
  // Body : { depositAmount?, depositPaid, depositNotes? }
  // ─────────────────────────────────────────────────────────────
  async updateDeposit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { depositAmount, depositPaid, depositNotes } = req.body;
      const reservation = await ReservationModel.findByPk(id);
      if (!reservation) return res.status(404).json({ success: false, error: 'Non trouvée' });

      const patch: Partial<{
        depositAmount: number;
        depositPaid: boolean;
        depositPaidAt: Date | null;
        depositNotes: string;
      }> = {};

      if (depositAmount !== undefined) patch.depositAmount = parseFloat(depositAmount);
      if (depositPaid   !== undefined) {
        patch.depositPaid   = Boolean(depositPaid);
        patch.depositPaidAt = depositPaid ? new Date() : null;
      }
      if (depositNotes !== undefined) patch.depositNotes = depositNotes;

      await reservation.update(patch);
      return res.json({ success: true, data: reservation });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PATCH /reservations/:id/inspection
  // Body : { inspection: Record<string, { status, note }> }
  // ─────────────────────────────────────────────────────────────
  async saveInspection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { inspection } = req.body;

      if (!inspection || typeof inspection !== 'object') {
        return res.status(400).json({
          success: false,
          error: "Le champ 'inspection' est requis et doit être un objet.",
        });
      }

      const reservation = await ReservationModel.findByPk(id);
      if (!reservation) {
        return res.status(404).json({ success: false, error: 'Réservation non trouvée.' });
      }

      await reservation.update({ inspection });
      return res.json({ success: true, data: reservation });
    } catch (error: any) {
      console.error('Erreur saveInspection:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // GET /availability?checkIn=&checkOut=
  // ─────────────────────────────────────────────────────────────
  async checkAvailability(req: Request, res: Response) {
    try {
      const { checkIn, checkOut } = req.query;
      const conflict = await ReservationModel.findOne({
        where: {
          status: { [Op.in]: ['confirmed', 'pending'] },
          [Op.and]: [
            { checkInDate:  { [Op.lt]: checkOut as string } },
            { checkOutDate: { [Op.gt]: checkIn  as string } },
          ],
        },
      });
      return res.json({ available: !conflict });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // GET /clients
  // ─────────────────────────────────────────────────────────────
  async getClients(req: Request, res: Response) {
    try {
      const clients = await ReservationModel.findAll({
        attributes: [
          'email',
          [fn('MAX', col('firstName')), 'firstName'],
          [fn('MAX', col('lastName')),  'lastName'],
          [fn('MAX', col('phone')),     'phone'],
          [fn('COUNT', col('id')),      'stays'],
          [fn('SUM',   col('totalPrice')), 'totalSpent'],
        ],
        group:   ['email'],
        order:   [[fn('SUM', col('totalPrice')), 'DESC']],
        raw: true,
      });
      return res.json({ success: true, data: clients });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // GET /dashboard/stats
  // ─────────────────────────────────────────────────────────────
  async getDashboardStats(req: Request, res: Response) {
    try {
      const monthlyData = await ReservationModel.findAll({
        attributes: [
          [fn('MONTH', col('checkInDate')), 'month'],
          [fn('SUM', col('totalPrice')),    'revenue'],
          [Sequelize.literal('SUM(DATEDIFF(checkOutDate, checkInDate))'), 'nights'],
        ],
        where:  { status: 'confirmed' },
        group:  [fn('MONTH', col('checkInDate'))],
        order:  [[fn('MONTH', col('checkInDate')), 'ASC']],
        raw: true,
      });

      const sourcesData = await ReservationModel.findAll({
        attributes: ['source', [fn('COUNT', col('id')), 'count']],
        group:  ['source'],
        raw: true,
      });

      const pendingDeposits = await ReservationModel.count({
        where: {
          status:        { [Op.in]: ['pending', 'confirmed'] },
          depositPaid:   false,
          depositAmount: { [Op.gt]: 0 },
        },
      });
      const pendingDepositTotal = await ReservationModel.sum('depositAmount', {
        where: {
          status:        { [Op.in]: ['pending', 'confirmed'] },
          depositPaid:   false,
          depositAmount: { [Op.gt]: 0 },
        },
      });

      const totalRevenue = await ReservationModel.sum('totalPrice',  { where: { status: 'confirmed' } });
      const totalClients = await ReservationModel.count({ distinct: true, col: 'email' });
      const upcoming     = await ReservationModel.count({
        where: { status: 'confirmed', checkInDate: { [Op.gte]: new Date() } },
      });

      const monthNames = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];
      const formattedRevenue = monthlyData.map((d: any) => ({
        m:       monthNames[d.month - 1] || 'Inconnu',
        revenue: parseFloat(d.revenue)   || 0,
        nights:  parseInt(d.nights)      || 0,
      }));

      const formattedSources = sourcesData.map((s: any) => ({
        name:  s.source.charAt(0).toUpperCase() + s.source.slice(1),
        value: parseInt(s.count) || 0,
      }));

      return res.json({
        success: true,
        data: {
          revenue: formattedRevenue.length > 0 ? formattedRevenue : [{ m: 'Aucun', revenue: 0, nights: 0 }],
          sources: formattedSources.length > 0 ? formattedSources : [{ name: 'Aucune', value: 0 }],
          totals: {
            revenue:             totalRevenue  || 0,
            clients:             totalClients  || 0,
            upcoming:            upcoming       || 0,
            nights:              formattedRevenue.reduce((a, c) => a + c.nights, 0),
            pendingDeposits,
            pendingDepositTotal: pendingDepositTotal || 0,
          },
        },
      });
    } catch (error: any) {
      console.error('Erreur DashboardStats:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Utilitaires privés
  // ─────────────────────────────────────────────────────────────
  private async calculateTotalPrice(checkIn: string | Date, checkOut: string | Date): Promise<number> {
    const start     = new Date(checkIn);
    const end       = new Date(checkOut);
    const basePrice = parseFloat(process.env.PROPERTY_PRICE_PER_NIGHT || '150');

    const checkInStr  = start.toISOString().split('T')[0];
    const checkOutStr = end.toISOString().split('T')[0];

    const customPrices = await CustomPrice.findAll({
      where: { specificDate: { [Op.between]: [checkInStr, checkOutStr] } },
    });
    const priceMap: Record<string, number> = {};
    customPrices.forEach(cp => { priceMap[cp.specificDate] = parseFloat(cp.price as any); });

    let total = 0;
    const cursor = new Date(start);
    while (cursor < end) {
      const ds = cursor.toISOString().split('T')[0];
      total += priceMap[ds] !== undefined ? priceMap[ds] : basePrice;
      cursor.setDate(cursor.getDate() + 1);
    }
    return Math.round(total * 100) / 100;
  }

  private calculateNights(checkIn: string | Date, checkOut: string | Date): number {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}