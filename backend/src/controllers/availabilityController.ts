import { Request, Response } from 'express';
import { ReservationService } from '../services/reservationService'; // Import du nouveau service
import { EmailService } from '../services/emailService'; // Import de l'email service
import { Op } from 'sequelize';
import { Reservation as ReservationModel } from '../models/Reservation';

export class AvailabilityController {
  private reservationService: ReservationService;
  private emailService: EmailService;

  constructor() {
    this.reservationService = new ReservationService();
    this.emailService = new EmailService();
  }
  
  

  // ============================================
  // GET: Obtenir le calendrier d'un mois
  // ============================================
  async getMonthCalendar(req: Request, res: Response) {
    try {
      const { year, month } = req.query;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          error: 'year et month sont requis',
        });
      }

      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);

      // Validation
      if (monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          success: false,
          error: 'Mois invalide (1-12)',
        });
      }

      const calendar = await this.generateCalendar(yearNum, monthNum);

      res.json({
        success: true,
        data: calendar,
        year: yearNum,
        month: monthNum,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ============================================
  // GET: Vérifier la disponibilité d'une plage de dates
  // ============================================
  async checkDateRange(req: Request, res: Response) {
    try {
      const { checkIn, checkOut } = req.query;

      if (!checkIn || !checkOut) {
        return res.status(400).json({
          success: false,
          error: 'checkIn et checkOut sont requis',
        });
      }

      const isAvailable = await this.reservationService.checkAvailability(
        checkIn as string,
        checkOut as string
      );

      res.json({
        success: true,
        available: isAvailable,
        checkIn,
        checkOut,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // ============================================
  // GET: Obtenir les dates réservées
  // ============================================
  async getReservedDates(req: Request, res: Response) {
    try {
      const { year, month } = req.query;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          error: 'year et month sont requis',
        });
      }

      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);

      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0);

      // Chercher les réservations confirmées du mois
      const reservations = await ReservationModel.findAll({
        where: {
          status: { [Op.in]: ['pending', 'confirmed'] },
          checkInDate: { [Op.lte]: endDate },
          checkOutDate: { [Op.gte]: startDate },
        },
        attributes: ['checkInDate', 'checkOutDate'],
        raw: true,
      });

      // Générer les dates occupées
      const occupiedDates = this.generateOccupiedDates(
        reservations as any,
        yearNum,
        monthNum
      );

      res.json({
        success: true,
        data: occupiedDates,
        year: yearNum,
        month: monthNum,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ============================================
  // GET: Tarif pour une plage de dates
  // ============================================
  async calculatePrice(req: Request, res: Response) {
    try {
      const { checkIn, checkOut } = req.query;

      if (!checkIn || !checkOut) {
        return res.status(400).json({
          success: false,
          error: 'checkIn et checkOut sont requis',
        });
      }

      const checkInDate = new Date(checkIn as string);
      const checkOutDate = new Date(checkOut as string);

      if (checkInDate >= checkOutDate) {
        return res.status(400).json({
          success: false,
          error: 'Dates invalides',
        });
      }

      const pricePerNight = parseFloat(
        process.env.PROPERTY_PRICE_PER_NIGHT || '150'
      );
      const msPerDay = 24 * 60 * 60 * 1000;
      const nights = Math.round(
        (checkOutDate.getTime() - checkInDate.getTime()) / msPerDay
      );

      const totalPrice = nights * pricePerNight;

      res.json({
        success: true,
        data: {
          checkIn: checkInDate.toISOString().split('T')[0],
          checkOut: checkOutDate.toISOString().split('T')[0],
          nights,
          pricePerNight,
          totalPrice,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ============================================
  // MÉTHODES PRIVÉES
  // ============================================

  private async generateCalendar(year: number, month: number): Promise<any[]> {
    // Récupérer les dates réservées
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const reservations = await ReservationModel.findAll({
      where: {
        status: { [Op.in]: ['pending', 'confirmed'] },
        checkInDate: { [Op.lte]: endDate },
        checkOutDate: { [Op.gte]: startDate },
      },
      attributes: ['checkInDate', 'checkOutDate'],
      raw: true,
    });

    // Générer les données du calendrier
    const daysInMonth = endDate.getDate();
    const calendar = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];

      // Vérifier si la date est occupée
      const isOccupied = this.isDateOccupied(date, reservations as any);

      calendar.push({
        date: dateStr,
        day,
        month,
        year,
        available: !isOccupied,
        dayOfWeek: date.getDay(),
        dayName: this.getDayName(date.getDay()),
      });
    }

    return calendar;
  }

  private generateOccupiedDates(
    reservations: Array<{ checkInDate: Date; checkOutDate: Date }>,
    year: number,
    month: number
  ): string[] {
    const occupiedDates: Set<string> = new Set();

    for (const reservation of reservations) {
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);

      // Ajouter toutes les dates entre checkIn et checkOut
      let currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        if (
          currentDate.getFullYear() === year &&
          currentDate.getMonth() === month - 1
        ) {
          occupiedDates.add(currentDate.toISOString().split('T')[0]);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return Array.from(occupiedDates);
  }

  private isDateOccupied(
    date: Date,
    reservations: Array<{ checkInDate: Date; checkOutDate: Date }>
  ): boolean {
    return reservations.some(
      (res) =>
        new Date(res.checkInDate) <= date && date < new Date(res.checkOutDate)
    );
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days[dayOfWeek];
  }
}