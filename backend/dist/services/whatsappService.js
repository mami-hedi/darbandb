"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyCancellation = exports.notifyNewReservation = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
const pino_1 = __importDefault(require("pino"));
// Variables globales pour maintenir la socket en mémoire
let sock = null;
/**
 * Initialise la connexion WhatsApp avec persistance de session
 */
async function connectToWhatsApp() {
    // Le dossier 'auth_info' stockera votre session (QR code scanné 1 seule fois)
    const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)('./auth_info');
    sock = (0, baileys_1.makeWASocket)({
        logger: (0, pino_1.default)({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true, // Affiche le QR code dans votre console au lancement
    });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            // Reconnexion automatique si la déconnexion n'est pas volontaire
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== baileys_1.DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('🔄 Reconnexion en cours...');
                connectToWhatsApp();
            }
        }
        else if (connection === 'open') {
            console.log('✅ Service WhatsApp opérationnel');
        }
    });
}
/**
 * Fonction utilitaire pour attendre que la socket soit prête
 */
const waitForSocket = async () => {
    let retries = 10;
    while (!sock && retries > 0) {
        await new Promise(res => setTimeout(res, 1000));
        retries--;
    }
    return sock;
};
// Initialisation au démarrage du serveur
connectToWhatsApp().catch(err => console.error('Erreur init WhatsApp:', err));
/**
 * Envoie une notification pour une nouvelle réservation
 */
const notifyNewReservation = async (reservation) => {
    const activeSock = await waitForSocket();
    if (!activeSock)
        throw new Error('WhatsApp non initialisé');
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '';
    const message = `🔔 *Nouvelle Réservation Dar B&B*
👤 Client: ${reservation.firstName} ${reservation.lastName}
📅 Dates: ${reservation.checkInDate} au ${reservation.checkOutDate}
👥 Invités: ${reservation.numberOfGuests}
💰 Total: ${reservation.totalPrice} TND
📝 Demandes: ${reservation.specialRequests || 'Aucune'}`;
    await activeSock.sendMessage(adminPhone, { text: message });
};
exports.notifyNewReservation = notifyNewReservation;
/**
 * Envoie une notification pour une annulation
 */
const notifyCancellation = async (reservation) => {
    const activeSock = await waitForSocket();
    if (!activeSock)
        throw new Error('WhatsApp non initialisé');
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '';
    const message = `❌ *Annulation de réservation*
La réservation de ${reservation.firstName} ${reservation.lastName} (${reservation.checkInDate}) a été annulée.`;
    await activeSock.sendMessage(adminPhone, { text: message });
};
exports.notifyCancellation = notifyCancellation;
