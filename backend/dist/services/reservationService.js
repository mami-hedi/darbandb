"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationService = void 0;
const sequelize_1 = require("sequelize");
const Reservation_1 = require("../models/Reservation");
class ReservationService {
    /**
     * Vérifie si une plage de dates est libre de toute réservation
     */
    async checkAvailability(checkIn, checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        // Sécurité : checkIn doit être avant checkOut
        if (checkInDate >= checkOutDate) {
            throw new Error("La date de départ doit être après la date d'arrivée.");
        }
        const conflict = await Reservation_1.Reservation.findOne({
            where: {
                status: { [sequelize_1.Op.in]: ['pending', 'confirmed'] },
                // Logique de chevauchement : (StartA < EndB) AND (EndA > StartB)
                [sequelize_1.Op.and]: [
                    { checkInDate: { [sequelize_1.Op.lt]: checkOutDate } },
                    { checkOutDate: { [sequelize_1.Op.gt]: checkInDate } }
                ]
            }
        });
        return !conflict;
    }
    /**
     * Calcule le montant total
     */
    calculatePrice(checkIn, checkOut, rate) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = end.getTime() - start.getTime();
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights * rate : 0;
    }
}
exports.ReservationService = ReservationService;
