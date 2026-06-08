import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';

// Variables globales pour maintenir la socket en mémoire
let sock: any;

async function connectToWhatsApp() {
    // Le dossier 'auth_info' stockera votre session (QR code scanné 1 seule fois)
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    sock = makeWASocket({
        logger: pino({ level: 'silent' }) as any,
        auth: state,
        printQRInTerminal: true, // Affiche le QR code dans votre console au lancement
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('🔄 Reconnexion en cours...');
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ Service WhatsApp opérationnel');
        }
    });
}

// Initialisation au démarrage du serveur
connectToWhatsApp();

// Fonction pour envoyer les notifications
export const notifyNewReservation = async (reservation: any) => {
    if (!sock) throw new Error('WhatsApp non initialisé');

    // Format: 216XXXXXXXXX@s.whatsapp.net
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || ''; 
    const message = `🔔 *Nouvelle Réservation Dar B&B*
👤 Client: ${reservation.firstName} ${reservation.lastName}
📅 Dates: ${reservation.checkInDate} au ${reservation.checkOutDate}
👥 Invités: ${reservation.numberOfGuests}
💰 Total: ${reservation.totalPrice} TND
📝 Demandes: ${reservation.specialRequests || 'Aucune'}`;

    await sock.sendMessage(adminPhone, { text: message });
};

export const notifyCancellation = async (reservation: any) => {
    if (!sock) throw new Error('WhatsApp non initialisé');

    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '';
    const message = `❌ *Annulation de réservation*
La réservation de ${reservation.firstName} ${reservation.lastName} (${reservation.checkInDate}) a été annulée.`;

    await sock.sendMessage(adminPhone, { text: message });
};