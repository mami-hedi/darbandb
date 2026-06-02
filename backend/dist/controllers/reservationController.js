"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationController = void 0;
const Reservation_1 = require("../models/Reservation");
const emailService_1 = require("../services/emailService");
const sequelize_1 = require("sequelize");
const CustomPrice_1 = require("../models/CustomPrice");
class ReservationController {
    constructor() {
        this.emailService = new emailService_1.EmailService();
        this.createReservation = this.createReservation.bind(this);
        this.getReservations = this.getReservations.bind(this);
        this.updateReservation = this.updateReservation.bind(this);
        this.updateReservationStatus = this.updateReservationStatus.bind(this);
        this.updateDeposit = this.updateDeposit.bind(this);
        this.checkAvailability = this.checkAvailability.bind(this);
        this.getClients = this.getClients.bind(this);
        this.getDashboardStats = this.getDashboardStats.bind(this);
        this.getPricePreview = this.getPricePreview.bind(this);
    }
    // ─────────────────────────────────────────────────────────────
    // POST /reservations  — créer une réservation
    // ─────────────────────────────────────────────────────────────
    async createReservation(req, res) {
        try {
            const { firstName, lastName, email, phone, numberOfGuests, checkInDate, checkOutDate, specialRequests, depositAmount, } = req.body;
            // Vérification disponibilité
            const conflict = await Reservation_1.Reservation.findOne({
                where: {
                    status: { [sequelize_1.Op.in]: ['confirmed', 'pending'] },
                    [sequelize_1.Op.and]: [
                        { checkInDate: { [sequelize_1.Op.lt]: checkOutDate } },
                        { checkOutDate: { [sequelize_1.Op.gt]: checkInDate } },
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
            // Si depositAmount fourni on l'utilise, sinon 30% arrondi
            const deposit = depositAmount != null
                ? parseFloat(depositAmount)
                : Math.round(totalPrice * 0.3 * 100) / 100;
            const refNumber = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            const reservation = await Reservation_1.Reservation.create({
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
            });
            try {
                await this.emailService.sendConfirmationEmail(reservation);
            }
            catch (e) {
                console.error('Email non envoyé:', e);
            }
            return res.status(201).json({ success: true, data: reservation });
        }
        catch (error) {
            console.error('Erreur createReservation:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    // ─────────────────────────────────────────────────────────────
    // GET /reservations
    // ─────────────────────────────────────────────────────────────
    async getReservations(req, res) {
        try {
            const { status, month } = req.query;
            const where = {};
            if (status && status !== 'all')
                where.status = status;
            if (month) {
                const [year, m] = month.split('-');
                where.checkInDate = {
                    [sequelize_1.Op.between]: [new Date(+year, +m - 1, 1), new Date(+year, +m, 0)],
                };
            }
            const reservations = await Reservation_1.Reservation.findAll({
                where,
                order: [['checkInDate', 'DESC']],
            });
            return res.json({ success: true, data: reservations });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    // ─────────────────────────────────────────────────────────────
    // GET /reservations/price-preview?checkIn=&checkOut=
    // Retourne le détail nuit par nuit + total (utile pour le formulaire)
    // ─────────────────────────────────────────────────────────────
    async getPricePreview(req, res) {
        try {
            const { checkIn, checkOut } = req.query;
            if (!checkIn || !checkOut) {
                return res.status(400).json({ success: false, error: 'Dates manquantes.' });
            }
            const nights = this.calculateNights(checkIn, checkOut);
            if (nights <= 0) {
                return res.status(400).json({ success: false, error: 'Dates invalides.' });
            }
            const basePrice = parseFloat(process.env.PROPERTY_PRICE_PER_NIGHT || '150');
            const customPrices = await CustomPrice_1.CustomPrice.findAll({
                where: { specificDate: { [sequelize_1.Op.between]: [checkIn, checkOut] } },
            });
            const priceMap = {};
            customPrices.forEach(cp => { priceMap[cp.specificDate] = parseFloat(cp.price); });
            const breakdown = [];
            let total = 0;
            const cursor = new Date(checkIn);
            const end = new Date(checkOut);
            while (cursor < end) {
                const ds = cursor.toISOString().split('T')[0];
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
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    // ─────────────────────────────────────────────────────────────
    // PUT /reservations/:id  — modifier une réservation
    // ─────────────────────────────────────────────────────────────
    async updateReservation(req, res) {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };
            const reservation = await Reservation_1.Reservation.findByPk(id);
            if (!reservation)
                return res.status(404).json({ success: false, error: 'Non trouvée' });
            const oldStatus = reservation.status;
            // Recalcul prix si les dates changent
            if (updateData.checkInDate || updateData.checkOutDate) {
                const nights = this.calculateNights(updateData.checkInDate || reservation.checkInDate, updateData.checkOutDate || reservation.checkOutDate);
                if (nights > 0) {
                    updateData.totalPrice = await this.calculateTotalPrice(updateData.checkInDate || reservation.checkInDate, updateData.checkOutDate || reservation.checkOutDate);
                    // Recalcul de l'acompte suggéré (si non surchargé explicitement)
                    if (updateData.depositAmount == null) {
                        updateData.depositAmount = Math.round(updateData.totalPrice * 0.3 * 100) / 100;
                    }
                }
            }
            await reservation.update(updateData);
            if (updateData.status && oldStatus !== 'cancelled' && updateData.status === 'cancelled') {
                await this.emailService.sendCancellationEmail(reservation);
            }
            return res.json({ success: true, data: reservation });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    // ─────────────────────────────────────────────────────────────
    // PATCH /reservations/:id/status
    // ─────────────────────────────────────────────────────────────
    async updateReservationStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const reservation = await Reservation_1.Reservation.findByPk(id);
            if (!reservation)
                return res.status(404).json({ success: false });
            const oldStatus = reservation.status;
            await reservation.update({ status });
            if (oldStatus !== 'cancelled' && status === 'cancelled') {
                await this.emailService.sendCancellationEmail(reservation);
            }
            return res.json({ success: true, data: reservation });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    // ─────────────────────────────────────────────────────────────
    // PATCH /reservations/:id/deposit  — NEW
    // Body : { depositAmount?, depositPaid, depositNotes? }
    // ─────────────────────────────────────────────────────────────
    async updateDeposit(req, res) {
        try {
            const { id } = req.params;
            const { depositAmount, depositPaid, depositNotes } = req.body;
            const reservation = await Reservation_1.Reservation.findByPk(id);
            if (!reservation)
                return res.status(404).json({ success: false, error: 'Non trouvée' });
            const patch = {};
            if (depositAmount !== undefined)
                patch.depositAmount = parseFloat(depositAmount);
            if (depositPaid !== undefined) {
                patch.depositPaid = Boolean(depositPaid);
                patch.depositPaidAt = depositPaid ? new Date() : null;
            }
            if (depositNotes !== undefined)
                patch.depositNotes = depositNotes;
            await reservation.update(patch);
            return res.json({ success: true, data: reservation });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    // ─────────────────────────────────────────────────────────────
    // GET /availability?checkIn=&checkOut=
    // ─────────────────────────────────────────────────────────────
    async checkAvailability(req, res) {
        try {
            const { checkIn, checkOut } = req.query;
            const conflict = await Reservation_1.Reservation.findOne({
                where: {
                    status: { [sequelize_1.Op.in]: ['confirmed', 'pending'] },
                    [sequelize_1.Op.and]: [
                        { checkInDate: { [sequelize_1.Op.lt]: checkOut } },
                        { checkOutDate: { [sequelize_1.Op.gt]: checkIn } },
                    ],
                },
            });
            return res.json({ available: !conflict });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    // ─────────────────────────────────────────────────────────────
    // GET /clients
    // ─────────────────────────────────────────────────────────────
    async getClients(req, res) {
        try {
            const clients = await Reservation_1.Reservation.findAll({
                attributes: [
                    'email',
                    [(0, sequelize_1.fn)('MAX', (0, sequelize_1.col)('firstName')), 'firstName'],
                    [(0, sequelize_1.fn)('MAX', (0, sequelize_1.col)('lastName')), 'lastName'],
                    [(0, sequelize_1.fn)('MAX', (0, sequelize_1.col)('phone')), 'phone'],
                    [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'stays'],
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('totalPrice')), 'totalSpent'],
                ],
                group: ['email'],
                order: [[(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('totalPrice')), 'DESC']],
                raw: true,
            });
            return res.json({ success: true, data: clients });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    // ─────────────────────────────────────────────────────────────
    // GET /dashboard/stats
    // ─────────────────────────────────────────────────────────────
    async getDashboardStats(req, res) {
        try {
            const monthlyData = await Reservation_1.Reservation.findAll({
                attributes: [
                    [(0, sequelize_1.fn)('MONTH', (0, sequelize_1.col)('checkInDate')), 'month'],
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('totalPrice')), 'revenue'],
                    [sequelize_1.Sequelize.literal('SUM(DATEDIFF(checkOutDate, checkInDate))'), 'nights'],
                ],
                where: { status: 'confirmed' },
                group: [(0, sequelize_1.fn)('MONTH', (0, sequelize_1.col)('checkInDate'))],
                order: [[(0, sequelize_1.fn)('MONTH', (0, sequelize_1.col)('checkInDate')), 'ASC']],
                raw: true,
            });
            const sourcesData = await Reservation_1.Reservation.findAll({
                attributes: ['source', [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']],
                group: ['source'],
                raw: true,
            });
            // Acomptes en attente
            const pendingDeposits = await Reservation_1.Reservation.count({
                where: {
                    status: { [sequelize_1.Op.in]: ['pending', 'confirmed'] },
                    depositPaid: false,
                    depositAmount: { [sequelize_1.Op.gt]: 0 },
                },
            });
            const pendingDepositTotal = await Reservation_1.Reservation.sum('depositAmount', {
                where: {
                    status: { [sequelize_1.Op.in]: ['pending', 'confirmed'] },
                    depositPaid: false,
                    depositAmount: { [sequelize_1.Op.gt]: 0 },
                },
            });
            const totalRevenue = await Reservation_1.Reservation.sum('totalPrice', { where: { status: 'confirmed' } });
            const totalClients = await Reservation_1.Reservation.count({ distinct: true, col: 'email' });
            const upcoming = await Reservation_1.Reservation.count({
                where: { status: 'confirmed', checkInDate: { [sequelize_1.Op.gte]: new Date() } },
            });
            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            const formattedRevenue = monthlyData.map((d) => ({
                m: monthNames[d.month - 1] || 'Inconnu',
                revenue: parseFloat(d.revenue) || 0,
                nights: parseInt(d.nights) || 0,
            }));
            const formattedSources = sourcesData.map((s) => ({
                name: s.source.charAt(0).toUpperCase() + s.source.slice(1),
                value: parseInt(s.count) || 0,
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
                        nights: formattedRevenue.reduce((a, c) => a + c.nights, 0),
                        pendingDeposits,
                        pendingDepositTotal: pendingDepositTotal || 0,
                    },
                },
            });
        }
        catch (error) {
            console.error('Erreur DashboardStats:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    // ─────────────────────────────────────────────────────────────
    // Utilitaires privés
    // ─────────────────────────────────────────────────────────────
    async calculateTotalPrice(checkIn, checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const basePrice = parseFloat(process.env.PROPERTY_PRICE_PER_NIGHT || '150');
        const checkInStr = start.toISOString().split('T')[0];
        const checkOutStr = end.toISOString().split('T')[0];
        const customPrices = await CustomPrice_1.CustomPrice.findAll({
            where: { specificDate: { [sequelize_1.Op.between]: [checkInStr, checkOutStr] } },
        });
        const priceMap = {};
        customPrices.forEach(cp => { priceMap[cp.specificDate] = parseFloat(cp.price); });
        let total = 0;
        const cursor = new Date(start);
        while (cursor < end) {
            const ds = cursor.toISOString().split('T')[0];
            total += priceMap[ds] !== undefined ? priceMap[ds] : basePrice;
            cursor.setDate(cursor.getDate() + 1);
        }
        return Math.round(total * 100) / 100;
    }
    calculateNights(checkIn, checkOut) {
        const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
}
exports.ReservationController = ReservationController;
