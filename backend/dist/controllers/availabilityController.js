"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityController = void 0;
const reservationService_1 = require("../services/reservationService");
const emailService_1 = require("../services/emailService");
const sequelize_1 = require("sequelize");
const Reservation_1 = require("../models/Reservation");
const ManualBlock_1 = require("../models/ManualBlock");
class AvailabilityController {
    constructor() {
        this.reservationService = new reservationService_1.ReservationService();
        this.emailService = new emailService_1.EmailService();
        this.getMonthCalendar = this.getMonthCalendar.bind(this);
        this.checkDateRange = this.checkDateRange.bind(this);
        this.calculatePrice = this.calculatePrice.bind(this);
        this.getReservedDates = this.getReservedDates.bind(this);
        this.getManualBlocks = this.getManualBlocks.bind(this);
        this.toggleBlock = this.toggleBlock.bind(this);
    }
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
            return res.json({ success: true, data: calendar, meta: { year: yearNum, month: monthNum } });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    async checkDateRange(req, res) {
        try {
            const { checkIn, checkOut } = req.query;
            if (!checkIn || !checkOut) {
                return res.status(400).json({ success: false, error: 'Dates manquantes' });
            }
            const isAvailable = await this.reservationService.checkAvailability(checkIn, checkOut);
            return res.json({ success: true, available: isAvailable, range: { checkIn, checkOut } });
        }
        catch (error) {
            return res.status(400).json({ success: false, error: error.message });
        }
    }
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
            const nights = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return res.json({
                success: true,
                data: { nights, pricePerNight, totalPrice: nights * pricePerNight, currency: 'EUR' },
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
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
                        { checkOutDate: { [sequelize_1.Op.between]: [startDate, endDate] } },
                    ],
                },
                attributes: ['checkInDate', 'checkOutDate'],
                raw: true,
            });
            const occupied = this.extractOccupiedDates(reservations);
            return res.json({ success: true, data: occupied });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    async getManualBlocks(req, res) {
        try {
            const blocks = await ManualBlock_1.ManualBlock.findAll({
                order: [['date', 'ASC']],
                raw: true,
            });
            return res.json({ success: true, data: blocks });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    async toggleBlock(req, res) {
        try {
            const { date, available, note, reason } = req.body;
            if (!date) {
                return res.status(400).json({ success: false, error: 'Date requise' });
            }
            if (available === false) {
                // BLOQUER
                const [block, created] = await ManualBlock_1.ManualBlock.findOrCreate({
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
            }
            else {
                // DÉBLOQUER
                const deleted = await ManualBlock_1.ManualBlock.destroy({ where: { date } });
                if (deleted === 0) {
                    return res.status(404).json({ success: false, error: 'Blocage non trouvé pour cette date' });
                }
                return res.json({ success: true, action: 'unblocked', data: { date } });
            }
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    async generateCalendar(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        // 1. Réservations clients
        const reservations = await Reservation_1.Reservation.findAll({
            where: {
                status: { [sequelize_1.Op.in]: ['pending', 'confirmed'] },
                checkInDate: { [sequelize_1.Op.lte]: endDate },
                checkOutDate: { [sequelize_1.Op.gte]: startDate },
            },
            attributes: ['checkInDate', 'checkOutDate'],
            raw: true,
        });
        // 2. Blocages manuels du mois
        const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
        const endStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
        const manualBlocks = await ManualBlock_1.ManualBlock.findAll({
            where: { date: { [sequelize_1.Op.between]: [startStr, endStr] } },
            raw: true,
        });
        const occupiedSet = new Set(this.extractOccupiedDates(reservations));
        const blockedSet = new Set(manualBlocks.map((b) => b.date));
        // 3. Générer les jours du mois
        const daysInMonth = endDate.getDate();
        const calendar = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dateObj = new Date(year, month - 1, day);
            calendar.push({
                date: dateStr,
                day,
                month,
                year,
                available: !occupiedSet.has(dateStr) && !blockedSet.has(dateStr),
                dayOfWeek: dateObj.getDay(),
                dayName: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][dateObj.getDay()],
            });
        }
        return calendar;
    }
    extractOccupiedDates(reservations) {
        const dates = new Set();
        reservations.forEach(res => {
            let current = new Date(res.checkInDate);
            const end = new Date(res.checkOutDate);
            while (current < end) {
                dates.add(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
        });
        return Array.from(dates);
    }
}
exports.AvailabilityController = AvailabilityController;
