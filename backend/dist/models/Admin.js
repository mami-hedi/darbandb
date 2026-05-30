"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAdminModel = exports.Admin = void 0;
// src/models/Admin.ts
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
class Admin extends sequelize_1.Model {
    async comparePassword(password) {
        return bcrypt_1.default.compare(password, this.password);
    }
}
exports.Admin = Admin;
const initAdminModel = (sequelize) => {
    Admin.init({
        id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        email: { type: sequelize_1.DataTypes.STRING, unique: true, allowNull: false },
        password: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    }, {
        sequelize,
        tableName: 'admins',
        hooks: {
            beforeCreate: async (admin) => {
                // Vérification de sécurité : on ne hache que si le password existe
                if (admin.password) {
                    const salt = await bcrypt_1.default.genSalt(12);
                    admin.password = await bcrypt_1.default.hash(admin.password, salt);
                }
            },
            // Ajout du hook beforeUpdate au cas où tu changes le mdp plus tard
            beforeUpdate: async (admin) => {
                if (admin.changed('password')) {
                    const salt = await bcrypt_1.default.genSalt(12);
                    admin.password = await bcrypt_1.default.hash(admin.password, salt);
                }
            }
        }
    });
};
exports.initAdminModel = initAdminModel;
