// services/whatsappService.ts
import twilio from 'twilio';
import { Reservation } from '../models/Reservation';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const FROM  = process.env.TWILIO_WHATSAPP_FROM!;   // whatsapp:+14155238886
const OWNER = process.env.WHATSAPP_OWNER_NUMBER!;   // whatsapp:+21600000000

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function nights(checkIn: Date | string, checkOut: Date | string): number {
  return Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
  );
}

// ─── Templates ────────────────────────────────────────────────────────────────

function ownerNewReservation(r: Reservation): string {
  const n = nights(r.checkInDate, r.checkOutDate);
  return `🏡 *Dar B&B — Nouvelle réservation*
🔖 Réf : ${r.refNumber}

👤 *${r.firstName} ${r.lastName}*
📞 ${r.phone || '—'}
📧 ${r.email}
👥 ${r.numberOfGuests} personne(s)

📅 Arrivée  : ${fmt(r.checkInDate)}
📅 Départ   : ${fmt(r.checkOutDate)}
🌙 Durée    : ${n} nuit(s)

💰 Total    : ${Number(r.totalPrice).toFixed(2)} €
💳 Acompte  : ${Number(r.depositAmount).toFixed(2)} € (à percevoir)
${r.specialRequests ? `\n💬 Demandes spéciales :\n_${r.specialRequests}_` : ''}
_Connectez-vous à l'espace admin pour confirmer._`;
}

function clientConfirmation(r: Reservation): string {
  const n = nights(r.checkInDate, r.checkOutDate);
  return `🏡 *Dar B&B — Demande reçue !*

Bonjour *${r.firstName} ${r.lastName}* 👋

Votre demande de réservation est bien enregistrée.

🔖 Référence : *${r.refNumber}*
📅 Arrivée   : ${fmt(r.checkInDate)}
📅 Départ    : ${fmt(r.checkOutDate)}
🌙 Durée     : ${n} nuit(s)
💰 Total     : ${Number(r.totalPrice).toFixed(2)} €

Nous vous confirmerons votre séjour très prochainement.

À bientôt ! 🌿
_L'équipe Dar B&B_`;
}

function ownerCancellation(r: Reservation): string {
  return `❌ *Dar B&B — Réservation annulée*
🔖 Réf : ${r.refNumber}

👤 ${r.firstName} ${r.lastName}
📅 ${fmt(r.checkInDate)} → ${fmt(r.checkOutDate)}
💰 ${Number(r.totalPrice).toFixed(2)} €

_Statut mis à jour dans l'espace admin._`;
}

// ─── Fonctions exportées ──────────────────────────────────────────────────────

async function sendToOwner(body: string): Promise<void> {
  await client.messages.create({ from: FROM, to: OWNER, body });
}

async function sendToClient(phone: string, body: string): Promise<void> {
  const tel = phone.trim();
  if (!tel.startsWith('+')) {
    console.warn(`[WA] Numéro ignoré (format non international) : ${tel}`);
    return;
  }
  await client.messages.create({ from: FROM, to: `whatsapp:${tel}`, body });
}

// ─── API publique ─────────────────────────────────────────────────────────────

export async function notifyNewReservation(r: Reservation): Promise<void> {
  try {
    await sendToOwner(ownerNewReservation(r));
    console.log(`[WA] Propriétaire notifié — nouvelle réservation ${r.refNumber}`);
  } catch (err: any) {
    console.error('[WA] Erreur envoi propriétaire :', err.message);
  }

  if (r.phone) {
    try {
      await sendToClient(r.phone, clientConfirmation(r));
      console.log(`[WA] Client notifié — ${r.phone}`);
    } catch (err: any) {
      console.error('[WA] Erreur envoi client :', err.message);
    }
  }
}

export async function notifyCancellation(r: Reservation): Promise<void> {
  try {
    await sendToOwner(ownerCancellation(r));
    console.log(`[WA] Propriétaire notifié — annulation ${r.refNumber}`);
  } catch (err: any) {
    console.error('[WA] Erreur annulation WA :', err.message);
  }
}