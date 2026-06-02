"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initReservationModel = exports.Reservation = void 0;
const sequelize_1 = require("sequelize");
class Reservation extends sequelize_1.Model {
}
exports.Reservation = Reservation;
const initReservationModel = (sequelize) => {
    Reservation.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        refNumber: {
            type: sequelize_1.DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        firstName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        lastName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        email: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        phone: { type: sequelize_1.DataTypes.STRING, allowNull: true },
        checkInDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
        checkOutDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
        numberOfGuests: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2,
        },
        totalPrice: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        specialRequests: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
        source: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: 'direct',
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
            defaultValue: 'pending',
        },
        // ── Paiement / acompte ──
        depositAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Montant de l\'acompte demandé (ex : 30% du totalPrice)',
        },
        depositPaid: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Vrai si l\'acompte a été encaissé',
        },
        depositPaidAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Date de réception de l\'acompte',
        },
        depositNotes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Notes libres sur le mode de paiement, référence virement, etc.',
        },
    }, {
        sequelize,
        tableName: 'reservations',
        timestamps: true,
    });
    return Reservation;
};
exports.initReservationModel = initReservationModel;
