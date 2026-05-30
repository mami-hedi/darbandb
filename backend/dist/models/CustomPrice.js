"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCustomPriceModel = exports.CustomPrice = void 0;
const sequelize_1 = require("sequelize");
class CustomPrice extends sequelize_1.Model {
}
exports.CustomPrice = CustomPrice;
const initCustomPriceModel = (sequelize) => {
    CustomPrice.init({
        specificDate: {
            // Changement vers STRING pour un contrôle total du format 'YYYY-MM-DD'
            // et éviter les conversions automatiques de fuseaux horaires
            type: sequelize_1.DataTypes.STRING(10),
            primaryKey: true,
            allowNull: false,
            field: 'specific_date',
        },
        price: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            // Getter personnalisé pour forcer le retour en Number (et pas en String/Decimal)
            get() {
                const rawValue = this.getDataValue('price');
                return rawValue !== null ? parseFloat(rawValue.toString()) : 0;
            }
        },
    }, {
        sequelize,
        tableName: 'custom_prices',
        timestamps: false,
    });
};
exports.initCustomPriceModel = initCustomPriceModel;
