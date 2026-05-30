"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSettingModel = exports.Setting = void 0;
// models/Setting.ts
const sequelize_1 = require("sequelize");
class Setting extends sequelize_1.Model {
}
exports.Setting = Setting;
const initSettingModel = (sequelize) => {
    Setting.init({
        key_name: { type: sequelize_1.DataTypes.STRING, primaryKey: true },
        value: { type: sequelize_1.DataTypes.STRING, allowNull: false }
    }, {
        sequelize,
        tableName: 'settings',
        timestamps: false
    });
};
exports.initSettingModel = initSettingModel;
