"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRateRuleModel = exports.RateRule = void 0;
const sequelize_1 = require("sequelize");
class RateRule extends sequelize_1.Model {
}
exports.RateRule = RateRule;
const initRateRuleModel = (sequelize) => {
    RateRule.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        basePrice: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'base_price',
        },
        startDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            field: 'start_date',
        },
        endDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            field: 'end_date',
        },
        daysOfWeek: {
            type: sequelize_1.DataTypes.STRING(20), // ex: "0,1,2,3,4,5,6"
            allowNull: false,
            field: 'days_of_week',
        },
        isActive: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            field: 'is_active',
        },
    }, {
        sequelize,
        tableName: 'rate_rules',
        timestamps: false,
    });
};
exports.initRateRuleModel = initRateRuleModel;
