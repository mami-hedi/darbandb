// src/services/whatsappService.ts
import axios from 'axios';

interface ReservationPayload {
  refNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  numberOfGuests: number;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  totalPrice: number;
  originalPrice?: number | null;
  promoCode?: string | null;
  promoDiscount?: number | null;
  depositAmount: number;
  specialRequests?: string | null;
  nights: number;
}

export async function sendReservationWhatsApp(data: ReservationPayload): Promise<void> {
  const token      = process.env.WHATSAPP_TOKEN;
  const phoneNumId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminNum   = process.env.ADMIN_WHATSAPP_NUMBER;

  if (!token || !phoneNumId || !adminNum) {
    console.warn('[WhatsApp] Variables manquantes — envoi ignoré');
    return;
  }

  const checkIn  = new Date(data.checkInDate).toLocaleDateString('fr-TN');
  const checkOut = new Date(data.checkOutDate).toLocaleDateString('fr-TN');

  const promoLine = data.promoCode
    ? `🏷️ *Promo :* ${data.promoCode} (−${data.promoDiscount}%)\n   *Prix original :* ${data.originalPrice} DT\n`
    : '';

  const message = `
🏡 *Nouvelle réservation — Dar B&B*
📋 *Réf :* ${data.refNumber}

👤 *Client :* ${data.firstName} ${data.lastName}
📧 *Email :* ${data.email}
📞 *Tél :* ${data.phone}
👥 *Personnes :* ${data.numberOfGuests}

📅 *Arrivée :* ${checkIn}
📅 *Départ :* ${checkOut}
🌙 *Durée :* ${data.nights} nuit${data.nights > 1 ? 's' : ''}

${promoLine}💰 *Total :* ${data.totalPrice} DT
💳 *Acompte (30%) :* ${data.depositAmount} DT
💬 *Demandes :* ${data.specialRequests || 'Aucune'}
`.trim();

  await axios.post(
    `https://graph.facebook.com/v19.0/${phoneNumId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: adminNum,
      type: 'text',
      text: { body: message },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
}