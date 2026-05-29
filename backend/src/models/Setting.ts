// models/Setting.ts
import { DataTypes, Model, Sequelize } from 'sequelize';

export class Setting extends Model {
  declare key_name: string;
  declare value: string;
}

export const initSettingModel = (sequelize: Sequelize) => {
  Setting.init({
    key_name: { type: DataTypes.STRING, primaryKey: true },
    value: { type: DataTypes.STRING, allowNull: false }
  }, {
    sequelize,
    tableName: 'settings',
    timestamps: false
  });
};