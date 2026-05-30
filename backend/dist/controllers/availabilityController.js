"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityController = void 0;
const reservationService_1 = require("../services/reservationService");
const emailService_1 = require("../services/emailService");
const sequelize_1 = require("sequelize");
const Reservation_1 = require("../models/Reservation");
class AvailabilityController {
    constructor() {
        this.reservationService = new reservationService_1.ReservationService();
        this.emailService = new emailService_1.EmailService();
        // Bind des méthodes pour ne pas perdre le 'this' dans les routes Express
        this.getMonthCalendar = this.getMonthCalendar.bind(this);
        this.checkDateRange = this.checkDateRange.bind(this);
        this.calculatePrice = this.calculatePrice.bind(this);
        this.getReservedDates = this.getReservedDates.bind(this);
    }
    /**
     * GET: Obtenir le calendrier complet d'un mois avec états de disponibilité
     */
    async getMonthCalendar(req, res) {
        try {
            const { year, month } = req.query;
            if (!year || !month) {
                return res.status(400).json({ success: false, error: 'Paramètres year et month requis' });
            }
            const yearNum = parseInt(year);
            const monthNum = parseInt(month);
            if (isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
                return res.status(400).json({ success: false, error: 'Format de date invalide' });
            }
            const calendar = await this.generateCalendar(yearNum, monthNum);
            return res.json({
                success: true,
                data: calendar,
                meta: { year: yearNum, month: monthNum }
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * GET: Vérifier si une plage spécifique est libre
     */
    async checkDateRange(req, res) {
        try {
            const { checkIn, checkOut } = req.query;
            if (!checkIn || !checkOut) {
                return res.status(400).json({ success: false, error: 'Dates manquantes' });
            }
            const isAvailable = await this.reservationService.checkAvailability(checkIn, checkOut);
            return res.json({
                success: true,
                available: isAvailable,
                range: { checkIn, checkOut }
            });
        }
        catch (error) {
            return res.status(400).json({ success: false, error: error.message });
        }
    }
    /**
     * GET: Calculer le prix total basé sur les nuits
     */
    async calculatePrice(req, res) {
        try {
            const { checkIn, checkOut } = req.query;
            if (!checkIn || !checkOut) {
                return res.status(400).json({ success: false, error: 'Dates manquantes' });
            }
            const start = new Date(checkIn);
            const end = new Date(checkOut);
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
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * GET: Liste simple des dates occupées (format string[])
     */
    async getReservedDates(req, res) {
        try {
            const { year, month } = req.query;
            const startDate = new Date(Number(year), Number(month) - 1, 1);
            const endDate = new Date(Number(year), Number(month), 0);
            const reservations = await Reservation_1.Reservation.findAll({
                where: {
                    status: { [sequelize_1.Op.in]: ['pending', 'confirmed'] },
                    [sequelize_1.Op.or]: [
                        { checkInDate: { [sequelize_1.Op.between]: [startDate, endDate] } },
                        { checkOutDate: { [sequelize_1.Op.between]: [startDate, endDate] } }
                    ]
                },
                attributes: ['checkInDate', 'checkOutDate'],
                raw: true
            });
            const occupied = this.extractOccupiedDates(reservations);
            return res.json({ success: true, data: occupied });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    // ============================================
    // LOGIQUE PRIVÉE OPTIMISÉE
    // ============================================
    async generateCalendar(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        // 1. Récupérer les réservations
        const reservations = await Reservation_1.Reservation.findAll({
            where: {
                status: { [sequelize_1.Op.in]: ['pending', 'confirmed'] },
                checkInDate: { [sequelize_1.Op.lte]: endDate },
                checkOutDate: { [sequelize_1.Op.gte]: startDate },
            },
            attributes: ['checkInDate', 'checkOutDate'],
            raw: true
        });
        // 2. Créer un Set pour une recherche en O(1)
        const occupiedSet = new Set(this.extractOccupiedDates(reservations));
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
    extractOccupiedDates(reservations) {
        const dates = new Set();
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
exports.AvailabilityController = AvailabilityController;
