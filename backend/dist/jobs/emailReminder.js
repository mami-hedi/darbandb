"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReminderJob = startReminderJob;
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize"); // ← ajoute Sequelize
const Reservation_1 = require("../models/Reservation");
const emailService_1 = require("../services/emailService");
const emailService = new emailService_1.EmailService();
function startReminderJob(sequelize) {
    // Tous les jours à 9h00
    node_cron_1.default.schedule('0 9 * * *', async () => {
        console.log('⏰ Running reminder email job...');
        try {
            // Chercher les réservations dont l'arrivée est dans 48h
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dayAfter = new Date();
            dayAfter.setDate(dayAfter.getDate() + 2);
            const reservations = await Reservation_1.Reservation.findAll({
                where: {
                    checkInDate: {
                        [sequelize_1.Op.between]: [tomorrow, dayAfter],
                    },
                    status: 'confirmed',
                    reminderSent: false,
                },
            });
            for (const reservation of reservations) {
                try {
                    await emailService.sendReminderEmail(reservation);
                    await reservation.update({ reminderSent: true, reminderSentAt: new Date() });
                    console.log(`✅ Reminder sent to ${reservation.email}`);
                }
                catch (error) {
                    console.error(`❌ Failed to send reminder to ${reservation.email}:`, error);
                }
            }
        }
        catch (error) {
            console.error('❌ Reminder job error:', error);
        }
    });
}
