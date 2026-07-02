import { Request, Response } from 'express';
import { Reservation as ReservationModel } from '../models/Reservation';
import { EmailService } from '../services/emailService';
import { Op, fn, col, Sequelize } from 'sequelize';
import { CustomPrice } from '../models/CustomPrice';
import { notifier } from '../services/sseService';
import { Setting } from '../models/Setting';
import { Notification } from '../models/Notification';
import { sendReservationWhatsApp } from '../services/whatsappService';

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
        originalPrice, promoCode, promoDiscount,
      } = req.body;

      // ── Vérification conflit de dates ──
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

      // ── Validation nuits ──
      const nights = this.calculateNights(checkInDate, checkOutDate);
      if (nights <= 0) {
        return res.status(400).json({ success: false, error: 'Dates invalides.' });
      }

      // ── Calcul prix ──
      const computedPrice = await this.calculateTotalPrice(checkInDate, checkOutDate);
      const finalPrice = (promoCode && req.body.totalPrice)
        ? parseFloat(req.body.totalPrice)
        : computedPrice;

      const deposit = depositAmount != null
        ? parseFloat(depositAmount)
        : Math.round(finalPrice * 0.3 * 100) / 100;

      const refNumber = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // ── Créer la réservation ──
      const reservation = await ReservationModel.create({
        refNumber,
        firstName, lastName, email, phone,
        numberOfGuests: parseInt(numberOfGuests) || 2,
        checkInDate, checkOutDate,
        totalPrice:    finalPrice,
        originalPrice: originalPrice  || null,
        promoCode:     promoCode      || null,
        promoDiscount: promoDiscount  || null,
        specialRequests,
        source:        'direct',
        status:        'pending',
        depositAmount: deposit,
        depositPaid:   false,
        depositPaidAt: null,
        depositNotes:  null,
        inspection:    null,
      });

      // ── Réponse immédiate au client ──
      res.status(201).json({ success: true, data: reservation });

      // ── Notification en base ──
      try {
        await Notification.create({
          guestName: `${reservation.firstName} ${reservation.lastName}`,
          checkIn:   reservation.checkInDate,
          checkOut:  reservation.checkOutDate,
          guests:    reservation.numberOfGuests,
          status:    'En attente',
          read:      false,
        });
      } catch (notifErr: any) {
        console.error('[Notification] Erreur sauvegarde:', notifErr.message);
      }

      // ── SSE ──
      notifier.emit('new-reservation', {
        id:        reservation.id,
        guestName: `${reservation.firstName} ${reservation.lastName}`,
        checkIn:   reservation.checkInDate,
        checkOut:  reservation.checkOutDate,
        guests:    reservation.numberOfGuests,
        status:    'En attente',
      });

      // ── Email de confirmation (non bloquant) ──
      this.emailService.sendConfirmationEmail(reservation)
        .catch((e: any) => console.error('[Email] non envoyé:', e.message));

      // ── WhatsApp admin (non bloquant) ──
      sendReservationWhatsApp({
        refNumber:      reservation.refNumber,
        firstName:      reservation.firstName,
        lastName:       reservation.lastName,
        email:          reservation.email,
        phone:          reservation.phone,
        numberOfGuests: reservation.numberOfGuests,
        checkInDate:    reservation.checkInDate,
        checkOutDate:   reservation.checkOutDate,
        totalPrice:     reservation.totalPrice,
        originalPrice:  reservation.originalPrice,
        promoCode:      reservation.promoCode,
        promoDiscount:  reservation.promoDiscount,
        depositAmount:  reservation.depositAmount,
        specialRequests: reservation.specialRequests,
        nights,
      }).catch((e: any) =>
        console.error('[WhatsApp] Échec envoi:', e?.response?.data || e.message)
      );

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
  // ✅ CORRIGÉ : basePrice depuis Setting (aligné avec calculateTotalPrice)
  //    + dates en heure locale (aligné avec calculateTotalPrice)
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

      const settingRow = await Setting.findOne({ where: { key_name: 'base_price' } });
      const basePrice  = settingRow ? parseFloat(settingRow.value) : 1500;

      const customPrices = await CustomPrice.findAll({
        where: { specificDate: { [Op.between]: [checkIn, checkOut] } },
      });
      const priceMap: Record<string, number> = {};
      customPrices.forEach(cp => { priceMap[cp.specificDate] = cp.price; });

      const breakdown: { date: string; price: number; isCustom: boolean }[] = [];
      let total = 0;
      const cursor = this.parseDateOnly(checkIn);
      const end    = this.parseDateOnly(checkOut);
      while (cursor < end) {
        const ds    = this.formatLocalDate(cursor);
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

      // ── NOUVEAU : compteurs par statut + total réservations ──
      const totalReservations = await ReservationModel.count();
      const confirmedCount    = await ReservationModel.count({ where: { status: 'confirmed' } });
      const pendingCount      = await ReservationModel.count({ where: { status: 'pending' } });
      const cancelledCount    = await ReservationModel.count({ where: { status: 'cancelled' } });

      // ── NOUVEAU : prochaine réservation (confirmée ou en attente, à venir) ──
      const nextReservationRow = await ReservationModel.findOne({
        where: {
          status:      { [Op.in]: ['confirmed', 'pending'] },
          checkInDate: { [Op.gte]: new Date() },
        },
        order: [['checkInDate', 'ASC']],
      });

      // ── NOUVEAU : réservations récentes (les plus récemment créées) ──
      const recentReservationsRows = await ReservationModel.findAll({
        order: [['createdAt', 'DESC']],
        limit: 6,
      });

      // ── NOUVEAU : top clients (agrégation par email) ──
      const topClientsRows = await ReservationModel.findAll({
        attributes: [
          'email',
          [fn('MAX', col('firstName')),    'firstName'],
          [fn('MAX', col('lastName')),     'lastName'],
          [fn('COUNT', col('id')),         'stays'],
          [fn('SUM',   col('totalPrice')), 'totalSpent'],
        ],
        where: { status: { [Op.in]: ['confirmed', 'pending'] } },
        group: ['email'],
        order: [[fn('SUM', col('totalPrice')), 'DESC']],
        limit: 6,
        raw: true,
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

      const formattedRecent = recentReservationsRows.map((r: any) => ({
        refNumber:     r.refNumber,
        firstName:     r.firstName,
        lastName:      r.lastName,
        checkInDate:   r.checkInDate,
        checkOutDate:  r.checkOutDate,
        totalPrice:    parseFloat(r.totalPrice) || 0,
        depositPaid:   r.depositPaid,
        depositAmount: parseFloat(r.depositAmount) || 0,
        status:        r.status,
        source:        r.source,
      }));

      const formattedTopClients = topClientsRows.map((c: any) => ({
        firstName:  c.firstName,
        lastName:   c.lastName,
        email:      c.email,
        stays:      parseInt(c.stays)        || 0,
        totalSpent: parseFloat(c.totalSpent) || 0,
      }));

      const formattedNext = nextReservationRow ? {
        firstName:      nextReservationRow.firstName,
        lastName:       nextReservationRow.lastName,
        checkInDate:    nextReservationRow.checkInDate,
        checkOutDate:   nextReservationRow.checkOutDate,
        numberOfGuests: nextReservationRow.numberOfGuests,
        totalPrice:     parseFloat(nextReservationRow.totalPrice as any) || 0,
        refNumber:      nextReservationRow.refNumber,
      } : undefined;

      return res.json({
        success: true,
        data: {
          revenue: formattedRevenue.length > 0 ? formattedRevenue : [{ m: 'Aucun', revenue: 0, nights: 0 }],
          sources: formattedSources.length > 0 ? formattedSources : [{ name: 'Aucune', value: 0 }],
          nextReservation:    formattedNext,
          recentReservations: formattedRecent,
          topClients:         formattedTopClients,
          totals: {
            revenue:             totalRevenue  || 0,
            clients:             totalClients  || 0,
            upcoming:            upcoming       || 0,
            nights:              formattedRevenue.reduce((a, c) => a + c.nights, 0),
            reservations:        totalReservations,
            confirmedCount,
            pendingCount,
            cancelledCount,
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

  // ✅ CORRIGÉ : basePrice depuis Setting + dates en heure locale
  private async calculateTotalPrice(checkIn: string | Date, checkOut: string | Date): Promise<number> {
    const start = typeof checkIn  === 'string' ? this.parseDateOnly(checkIn)  : checkIn;
    const end   = typeof checkOut === 'string' ? this.parseDateOnly(checkOut) : checkOut;

    const settingRow = await Setting.findOne({ where: { key_name: 'base_price' } });
    const basePrice  = settingRow ? parseFloat(settingRow.value) : 1500;

    const checkInStr  = this.formatLocalDate(start);
    const checkOutStr = this.formatLocalDate(end);

    const customPrices = await CustomPrice.findAll({
      where: { specificDate: { [Op.between]: [checkInStr, checkOutStr] } },
    });
    const priceMap: Record<string, number> = {};
    customPrices.forEach(cp => { priceMap[cp.specificDate] = cp.price; });

    let total = 0;
    const cursor = new Date(start);
    while (cursor < end) {
      const ds = this.formatLocalDate(cursor);
      total += priceMap[ds] !== undefined ? priceMap[ds] : basePrice;
      cursor.setDate(cursor.getDate() + 1);
    }
    return Math.round(total * 100) / 100;
  }

  private calculateNights(checkIn: string | Date, checkOut: string | Date): number {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // ✅ NOUVEAU : parse "YYYY-MM-DD" en Date LOCALE (évite le piège UTC de `new Date(string)`)
  private parseDateOnly(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // ✅ NOUVEAU : formate une Date en "YYYY-MM-DD" avec les getters LOCAUX
  private formatLocalDate(d: Date): string {
    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day   = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}