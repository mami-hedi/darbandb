"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initManualBlockModel = exports.ManualBlock = void 0;
const sequelize_1 = require("sequelize");
class ManualBlock extends sequelize_1.Model {
}
exports.ManualBlock = ManualBlock;
const initManualBlockModel = (sequelize) => {
    ManualBlock.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        date: {
            type: sequelize_1.DataTypes.DATEONLY, // Stocke uniquement YYYY-MM-DD, sans heure
            allowNull: false,
            unique: true, // Une seule entrée par date
        },
        note: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        reason: {
            type: sequelize_1.DataTypes.ENUM('maintenance', 'cleaning', 'family', 'other'),
            allowNull: false,
            defaultValue: 'other',
        },
    }, {
        sequelize,
        tableName: 'manual_blocks',
        timestamps: true,
    });
    return ManualBlock;
};
exports.initManualBlockModel = initManualBlockModel;
