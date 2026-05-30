"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationController = void 0;
const Reservation_1 = require("../models/Reservation");
const emailService_1 = require("../services/emailService");
const sequelize_1 = require("sequelize"); // Correction : Import de Sequelize ici
// Assurez-vous que le chemin relatif ../models/CustomPrice est correct selon votre structure de dossiers
const CustomPrice_1 = require("../models/CustomPrice");
class ReservationController {
    constructor() {
        this.emailService = new emailService_1.EmailService();
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
    async createReservation(req, res) {
        try {
            const { firstName, lastName, email, phone, numberOfGuests, checkInDate, checkOutDate, specialRequests, } = req.body;
            const existingReservation = await Reservation_1.Reservation.findOne({
                where: {
                    status: { [sequelize_1.Op.in]: ['confirmed', 'pending'] },
                    [sequelize_1.Op.and]: [
                        { checkInDate: { [sequelize_1.Op.lt]: checkOutDate } },
                        { checkOutDate: { [sequelize_1.Op.gt]: checkInDate } }
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
            //const pricePerNight = parseFloat(process.env.PROPERTY_PRICE_PER_NIGHT || '150');
            //const totalPrice = nights * pricePerNight;
            const totalPrice = await this.calculateTotalPrice(checkInDate, checkOutDate);
            const refNumber = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            const reservation = await Reservation_1.Reservation.create({
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
            }
            catch (emailErr) {
                console.error("Email de confirmation non envoyé:", emailErr);
            }
            return res.status(201).json({
                success: true,
                data: reservation,
                message: 'Réservation créée avec succès.',
            });
        }
        catch (error) {
            console.error("Erreur Controller (Create):", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
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
                raw: true
            });
            return res.json({ success: true, data: clients });
        }
        catch (error) {
            console.error("ERREUR SQL CLIENTS :", error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    async updateReservation(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const reservation = await Reservation_1.Reservation.findByPk(id);
            if (!reservation)
                return res.status(404).json({ success: false, error: 'Non trouvée' });
            const oldStatus = reservation.status;
            if (updateData.checkInDate || updateData.checkOutDate) {
                const nights = this.calculateNights(updateData.checkInDate || reservation.checkInDate, updateData.checkOutDate || reservation.checkOutDate);
                //if (nights > 0) {
                // const p = parseFloat(process.env.PROPERTY_PRICE_PER_NIGHT || '150');
                // updateData.totalPrice = nights * p;
                //}
                if (nights > 0) {
                    updateData.totalPrice = await this.calculateTotalPrice(updateData.checkInDate || reservation.checkInDate, updateData.checkOutDate || reservation.checkOutDate);
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
    async checkAvailability(req, res) {
        try {
            const { checkIn, checkOut } = req.query;
            const conflict = await Reservation_1.Reservation.findOne({
                where: {
                    status: { [sequelize_1.Op.in]: ['confirmed', 'pending'] },
                    [sequelize_1.Op.and]: [
                        { checkInDate: { [sequelize_1.Op.lt]: checkOut } },
                        { checkOutDate: { [sequelize_1.Op.gt]: checkIn } }
                    ]
                },
            });
            return res.json({ available: !conflict });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * GET - Statistiques globales pour le Dashboard (Admin)
     */
    async getDashboardStats(req, res) {
        try {
            // 1. Calcul des revenus et nuits par mois
            const monthlyData = await Reservation_1.Reservation.findAll({
                attributes: [
                    [(0, sequelize_1.fn)('MONTH', (0, sequelize_1.col)('checkInDate')), 'month'],
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('totalPrice')), 'revenue'],
                    // Utilisation d'un literal SQL pour calculer la différence de jours
                    [sequelize_1.Sequelize.literal('SUM(DATEDIFF(checkOutDate, checkInDate))'), 'nights']
                ],
                where: { status: 'confirmed' },
                group: [(0, sequelize_1.fn)('MONTH', (0, sequelize_1.col)('checkInDate'))],
                order: [[(0, sequelize_1.fn)('MONTH', (0, sequelize_1.col)('checkInDate')), 'ASC']],
                raw: true
            });
            // 2. Répartition par source
            const sourcesData = await Reservation_1.Reservation.findAll({
                attributes: [
                    'source',
                    [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']
                ],
                group: ['source'],
                raw: true
            });
            // 3. Totaux
            const totalRevenue = await Reservation_1.Reservation.sum('totalPrice', { where: { status: 'confirmed' } });
            const totalClients = await Reservation_1.Reservation.count({ distinct: true, col: 'email' });
            const upcoming = await Reservation_1.Reservation.count({
                where: {
                    status: 'confirmed',
                    checkInDate: { [sequelize_1.Op.gte]: new Date() }
                }
            });
            // 4. Formatage
            const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
            const formattedRevenue = monthlyData.map((d) => ({
                m: monthNames[d.month - 1] || 'Inconnu',
                revenue: parseFloat(d.revenue) || 0,
                nights: parseInt(d.nights) || 0
            }));
            const formattedSources = sourcesData.map((s) => ({
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
        }
        catch (error) {
            console.error("Erreur DashboardStats:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    async calculateTotalPrice(checkIn, checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const basePrice = parseFloat(process.env.PROPERTY_PRICE_PER_NIGHT || '150');
        // 1. Récupérer toutes les exceptions de prix entre ces deux dates
        const customPrices = await CustomPrice_1.CustomPrice.findAll({
            where: {
                specificDate: {
                    [sequelize_1.Op.between]: [checkIn, checkOut]
                }
            }
        });
        // Convertir en dictionnaire indexable pour un accès rapide
        const priceMap = {};
        customPrices.forEach(cp => {
            priceMap[cp.specificDate] = parseFloat(cp.price);
        });
        let totalPrice = 0;
        const currentCursor = new Date(start);
        // 2. Parcourir chaque nuitée (on s'arrête le jour du check-out)
        while (currentCursor < end) {
            const dateStr = currentCursor.toISOString().split('T')[0];
            // Si un prix spécifique existe en BDD pour cette nuit, on l'applique, sinon prix de base
            const nightPrice = priceMap[dateStr] !== undefined ? priceMap[dateStr] : basePrice;
            totalPrice += nightPrice;
            // Avancer d'un jour
            currentCursor.setDate(currentCursor.getDate() + 1);
        }
        return totalPrice;
    }
    calculateNights(checkIn, checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = end.getTime() - start.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
}
exports.ReservationController = ReservationController;
