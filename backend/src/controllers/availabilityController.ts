import { Request, Response } from 'express';
import { ReservationService } from '../services/reservationService';
import { EmailService } from '../services/emailService';
import { Op } from 'sequelize';
import { Reservation as ReservationModel } from '../models/Reservation';

export class AvailabilityController {
  private reservationService: ReservationService;
  private emailService: EmailService;

  constructor() {
    this.reservationService = new ReservationService();
    this.emailService = new EmailService();
    
    // Bind des méthodes pour ne pas perdre le 'this' dans les routes Express
    this.getMonthCalendar = this.getMonthCalendar.bind(this);
    this.checkDateRange = this.checkDateRange.bind(this);
    this.calculatePrice = this.calculatePrice.bind(this);
    this.getReservedDates = this.getReservedDates.bind(this);
  }

  /**
   * GET: Obtenir le calendrier complet d'un mois avec états de disponibilité
   */
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

      return res.json({
        success: true,
        data: calendar,
        meta: { year: yearNum, month: monthNum }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET: Vérifier si une plage spécifique est libre
   */
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

      return res.json({
        success: true,
        available: isAvailable,
        range: { checkIn, checkOut }
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * GET: Calculer le prix total basé sur les nuits
   */
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
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return res.json({
        success: true,
        data: {
          nights,
          pricePerNight,
          totalPrice: nights * pricePerNight,
          currency: 'EUR'
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET: Liste simple des dates occupées (format string[])
   */
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
            { checkOutDate: { [Op.between]: [startDate, endDate] } }
          ]
        },
        attributes: ['checkInDate', 'checkOutDate'],
        raw: true
      });

      const occupied = this.extractOccupiedDates(reservations as any);
      return res.json({ success: true, data: occupied });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ============================================
  // LOGIQUE PRIVÉE OPTIMISÉE
  // ============================================

  private async generateCalendar(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // 1. Récupérer les réservations
    const reservations = await ReservationModel.findAll({
      where: {
        status: { [Op.in]: ['pending', 'confirmed'] },
        checkInDate: { [Op.lte]: endDate },
        checkOutDate: { [Op.gte]: startDate },
      },
      attributes: ['checkInDate', 'checkOutDate'],
      raw: true
    });

    // 2. Créer un Set pour une recherche en O(1)
    const occupiedSet = new Set(this.extractOccupiedDates(reservations as any));

    // 3. Générer le mois
    const daysInMonth = endDate.getDate();
    const calendar = [];

    for (let day = 1; day <= daysInMonth; day++) {
      // Format YYYY-MM-DD sécurisé
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(year, month - 1, day);

      calendar.push({
        date: dateStr,
        day,
        month,
        year,
        available: !occupiedSet.has(dateStr),
        dayOfWeek: dateObj.getDay(),
        dayName: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][dateObj.getDay()]
      });
    }

    return calendar;
  }

  private extractOccupiedDates(reservations: any[]): string[] {
    const dates = new Set<string>();

    reservations.forEach(res => {
      let current = new Date(res.checkInDate);
      const end = new Date(res.checkOutDate);

      // On boucle pour chaque nuit de la réservation
      while (current < end) {
        dates.add(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });

    return Array.from(dates);
  }
}