import cron from 'node-cron';
import { Sequelize } from 'sequelize';
import { Reservation } from '../models/Reservation';
import { EmailService } from '../services/emailService';

const emailService = new EmailService();

export function startReminderJob(sequelize: Sequelize) {
  // Tous les jours à 9h00
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running reminder email job...');

    try {
      // Chercher les réservations dont l'arrivée est dans 48h
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      const reservations = await Reservation.findAll({
        where: {
          checkInDate: {
            [Sequelize.Op.between]: [tomorrow, dayAfter],
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
        } catch (error) {
          console.error(`❌ Failed to send reminder to ${reservation.email}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Reminder job error:', error);
    }
  });
}