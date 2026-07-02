import { Request, Response } from 'express';
import { ReservationService } from '../services/reservationService';
import { EmailService } from '../services/emailService';
import { Op } from 'sequelize';
import { Reservation as ReservationModel } from '../models/Reservation';
import { ManualBlock } from '../models/ManualBlock';
import { AirbnbBlock } from '../models/AirbnbBlock';
import { AirbnbSyncService } from '../services/airbnbSyncService';

export class AvailabilityController {
  private reservationService: ReservationService;
  private emailService: EmailService;
  private airbnbSyncService: AirbnbSyncService;

  constructor() {
    this.reservationService = new ReservationService();
    this.emailService = new EmailService();
    this.airbnbSyncService = new AirbnbSyncService();

    this.getMonthCalendar = this.getMonthCalendar.bind(this);
    this.checkDateRange = this.checkDateRange.bind(this);
    this.calculatePrice = this.calculatePrice.bind(this);
    this.getReservedDates = this.getReservedDates.bind(this);
    this.getManualBlocks = this.getManualBlocks.bind(this);
    this.toggleBlock = this.toggleBlock.bind(this);
    this.getAirbnbBlocks = this.getAirbnbBlocks.bind(this);
    this.triggerAirbnbSync = this.triggerAirbnbSync.bind(this);
  }

  async getMonthCalendar(req: Request, res: Response) {
    try {
      const { year, month } = req.query;
      if (!year || !month) {
        return res.status(400).json({ success: false, error: 'Paramètres year et month requis' });
      }
      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);
      if (isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ success: false, error: 'Format de date invalide' });
      }
      const calendar = await this.generateCalendar(yearNum, monthNum);
      return res.json({ success: true, data: calendar, meta: { year: yearNum, month: monthNum } });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async checkDateRange(req: Request, res: Response) {
    try {
      const { checkIn, checkOut } = req.query;
      if (!checkIn || !checkOut) {
        return res.status(400).json({ success: false, error: 'Dates manquantes' });
      }
      const isAvailable = await this.reservationService.checkAvailability(
        checkIn as string,
        checkOut as string
      );
      return res.json({ success: true, available: isAvailable, range: { checkIn, checkOut } });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async calculatePrice(req: Request, res: Response) {
    try {
      const { checkIn, checkOut } = req.query;
      if (!checkIn || !checkOut) {
        return res.status(400).json({ success: false, error: 'Dates manquantes' });
      }
      const start = new Date(checkIn as string);
      const end = new Date(checkOut as string);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
        return res.status(400).json({ success: false, error: 'Plage de dates invalide' });
      }
      const pricePerNight = parseFloat(process.env.PROPERTY_PRICE_PER_NIGHT || '150');
      const nights = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return res.json({
        success: true,
        data: { nights, pricePerNight, totalPrice: nights * pricePerNight, currency: 'EUR' },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getReservedDates(req: Request, res: Response) {
    try {
      const { year, month } = req.query;
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
      const reservations = await ReservationModel.findAll({
        where: {
          status: { [Op.in]: ['pending', 'confirmed'] },
          [Op.or]: [
            { checkInDate: { [Op.between]: [startDate, endDate] } },
            { checkOutDate: { [Op.between]: [startDate, endDate] } },
          ],
        },
        attributes: ['checkInDate', 'checkOutDate'],
        raw: true,
      });
      const occupied = this.extractOccupiedDates(reservations as any);
      return res.json({ success: true, data: occupied });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getManualBlocks(req: Request, res: Response) {
    try {
      const blocks = await ManualBlock.findAll({
        order: [['date', 'ASC']],
        raw: true,
      });
      return res.json({ success: true, data: blocks });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async toggleBlock(req: Request, res: Response) {
    try {
      const { date, available, note, reason } = req.body;

      if (!date) {
        return res.status(400).json({ success: false, error: 'Date requise' });
      }

      if (available === false) {
        const [block, created] = await ManualBlock.findOrCreate({
          where: { date },
          defaults: {
            date,
            note: note || '',
            reason: reason || 'other',
          },
        });

        if (!created) {
          await block.update({ note: note || '', reason: reason || 'other' });
        }

        return res.json({
          success: true,
          action: 'blocked',
          data: { id: block.id, date: block.date, note: block.note, reason: block.reason },
        });

      } else {
        const deleted = await ManualBlock.destroy({ where: { date } });
        if (deleted === 0) {
          return res.status(404).json({ success: false, error: 'Blocage non trouvé pour cette date' });
        }
        return res.json({ success: true, action: 'unblocked', data: { date } });
      }

    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAirbnbBlocks(req: Request, res: Response) {
    try {
      const blocks = await AirbnbBlock.findAll({
        order: [['startDate', 'ASC']],
        raw: true,
      });
      return res.json({ success: true, data: blocks });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async triggerAirbnbSync(req: Request, res: Response) {
    try {
      const result = await this.airbnbSyncService.sync();
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ✅ MODIFIÉ : ajout de arrivalBlocked (=!available) / departureBlocked
  //    pour gérer les "jours de transition" (turnover days) comme Airbnb :
  //    un jour peut être disponible en DÉPART uniquement, ou en ARRIVÉE
  //    uniquement, sans être totalement bloqué.
  // ─────────────────────────────────────────────────────────────
  private async generateCalendar(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // On étend la requête d'un jour AVANT le mois affiché : nécessaire pour
    // calculer correctement departureBlocked sur le 1er jour du mois
    // (qui dépend de la nuit de la veille, potentiellement dans le mois précédent).
    const queryStart = new Date(startDate);
    queryStart.setDate(queryStart.getDate() - 1);
    const queryStartStr = this.formatLocalDate(queryStart);

    const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const endStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    // 1. Réservations clients (site direct) — plage étendue
    const reservations = await ReservationModel.findAll({
      where: {
        status: { [Op.in]: ['pending', 'confirmed'] },
        checkInDate: { [Op.lte]: endDate },
        checkOutDate: { [Op.gte]: queryStart },
      },
      attributes: ['checkInDate', 'checkOutDate'],
      raw: true,
    });

    // 2. Blocages manuels — plage étendue
    const manualBlocks = await ManualBlock.findAll({
      where: { date: { [Op.between]: [queryStartStr, endStr] } },
      raw: true,
    });

    // 3. Blocages Airbnb (iCal) — plage étendue
    const airbnbBlocks = await AirbnbBlock.findAll({
      where: {
        startDate: { [Op.lte]: endStr },
        endDate: { [Op.gte]: queryStartStr },
      },
      raw: true,
    });

    const occupiedSet = new Set(this.extractOccupiedDates(reservations as any));
    const blockedSet = new Set(manualBlocks.map((b: any) => b.date));
    const airbnbSet = new Set(
      this.extractOccupiedDates(
        (airbnbBlocks as any[]).map((b: any) => ({
          checkInDate: b.startDate,
          checkOutDate: b.endDate,
        }))
      )
    );

    // Union de toutes les nuits occupées, toutes sources confondues —
    // sert de base au calcul arrivée/départ (le motif du blocage n'a pas
    // d'importance pour la logique de transition).
    const occupiedNights = new Set<string>([...occupiedSet, ...blockedSet, ...airbnbSet]);

    // 4. Générer les jours du mois
    const daysInMonth = endDate.getDate();
    const calendar = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(year, month - 1, day);

      const isOccupied = occupiedSet.has(dateStr);
      const isManuallyBlocked = blockedSet.has(dateStr);
      const isAirbnbBlocked = airbnbSet.has(dateStr);

      let source: 'website' | 'manual' | 'airbnb' | null = null;
      if (isAirbnbBlocked) source = 'airbnb';
      else if (isOccupied) source = 'website';
      else if (isManuallyBlocked) source = 'manual';

      // arrivalBlocked  : la nuit de CE jour est occupée → impossible d'arriver ce jour
      // departureBlocked: la nuit de la VEILLE est occupée → impossible de partir ce jour
      const prevDateObj = new Date(year, month - 1, day - 1);
      const prevDateStr = this.formatLocalDate(prevDateObj);

      const arrivalBlocked = occupiedNights.has(dateStr);
      const departureBlocked = occupiedNights.has(prevDateStr);

      calendar.push({
        date: dateStr,
        day,
        month,
        year,
        available: !arrivalBlocked, // ✅ inchangé : reflète toujours la possibilité d'ARRIVER
        departureBlocked,           // ✅ nouveau champ
        source,
        dayOfWeek: dateObj.getDay(),
        dayName: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][dateObj.getDay()],
      });
    }

    return calendar;
  }

  private extractOccupiedDates(reservations: any[]): string[] {
    const dates = new Set<string>();
    reservations.forEach(res => {
      let current = new Date(res.checkInDate);
      const end = new Date(res.checkOutDate);
      while (current < end) {
        dates.add(this.formatLocalDate(current));
        current.setDate(current.getDate() + 1);
      }
    });
    return Array.from(dates);
  }

  private formatLocalDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}