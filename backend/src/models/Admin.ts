// src/models/Admin.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';

export class Admin extends Model {
  public id!: number;
  public email!: string;
  public password!: string;

  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

export const initAdminModel = (sequelize: Sequelize) => {
  Admin.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
  }, {
    sequelize,
    tableName: 'admins',
    hooks: {
      beforeCreate: async (admin: Admin) => {
        // Vérification de sécurité : on ne hache que si le password existe
        if (admin.password) {
          const salt = await bcrypt.genSalt(12);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
      },
      // Ajout du hook beforeUpdate au cas où tu changes le mdp plus tard
      beforeUpdate: async (admin: Admin) => {
        if (admin.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
      }
    }
  });
};