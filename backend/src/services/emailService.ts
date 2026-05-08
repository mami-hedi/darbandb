import nodemailer from 'nodemailer';
import { Reservation } from '../models/Reservation';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  
  // Email de confirmation de réservation
  async sendConfirmationEmail(reservation: Reservation) {
    const checkIn = new Date(reservation.checkInDate).toLocaleDateString('fr-FR');
    const checkOut = new Date(reservation.checkOutDate).toLocaleDateString('fr-FR');
    const nights = this.calculateNights(reservation.checkInDate, reservation.checkOutDate);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Réservation Confirmée ✓</h2>
            <p>Cher(e) ${reservation.firstName},</p>
            <p>Merci pour votre réservation à <strong>B&B Hammamet</strong>.</p>
            
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #333;">
              <h3>Détails de votre réservation</h3>
              <p><strong>Référence:</strong> ${reservation.refNumber}</p>
              <p><strong>Arrivée:</strong> ${checkIn} (à partir de 14h)</p>
              <p><strong>Départ:</strong> ${checkOut} (avant 11h)</p>
              <p><strong>Nombre de nuits:</strong> ${nights}</p>
              <p><strong>Nombre de personnes:</strong> ${reservation.numberOfGuests}</p>
              <p><strong>Montant total:</strong> ${reservation.totalPrice} €</p>
            </div>

            <h3>Adresse de la propriété</h3>
            <p>
              Avenue de la Plage<br>
              8050 Hammamet, Tunisie<br>
              📞 +216 72 000 000
            </p>

            <p>Nous vous accueillons avec plaisir !</p>
            <p>Équipe B&B Hammamet</p>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      to: reservation.email,
      subject: `Réservation confirmée - Ref: ${reservation.refNumber}`,
      html: htmlContent,
    });
  }

  // Email de rappel (48h avant)
  async sendReminderEmail(reservation: Reservation) {
    const checkIn = new Date(reservation.checkInDate).toLocaleDateString('fr-FR');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Rappel: Votre arrivée demain! 🎉</h2>
            <p>Cher(e) ${reservation.firstName},</p>
            <p>Nous vous rappelons que vous arrivez demain à <strong>B&B Hammamet</strong>.</p>
            
            <div style="background: #fffacd; padding: 15px; border-left: 4px solid #ff9800;">
              <p><strong>Arrivée:</strong> ${checkIn}</p>
              <p><strong>Heure:</strong> 14h00 - 19h00</p>
            </div>

            <p><strong>Besoin d'aide?</strong></p>
            <p>📞 +216 72 000 000</p>
            <p>✉️ hello@bnb-hammamet.tn</p>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      to: reservation.email,
      subject: `Rappel: Votre arrivée demain - ${reservation.refNumber}`,
      html: htmlContent,
    });
  }

  // Email d'annulation
  async sendCancellationEmail(reservation: Reservation) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Réservation Annulée</h2>
            <p>Cher(e) ${reservation.firstName},</p>
            <p>Votre réservation <strong>${reservation.refNumber}</strong> a été annulée.</p>
            
            <p>Nous regrettons de vous voir partir. Pour toute question, contactez-nous :</p>
            <p>📞 +216 72 000 000</p>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      to: reservation.email,
      subject: `Annulation de réservation - ${reservation.refNumber}`,
      html: htmlContent,
    });
  }

  private calculateNights(checkIn: Date, checkOut: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / msPerDay);
  }
}