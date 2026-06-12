import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface ContactAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  createdAt?: Date;
}

type ContactCreationAttributes = Optional<ContactAttributes, 'id'>;

export class Contact extends Model<ContactAttributes, ContactCreationAttributes>
  implements ContactAttributes {
  declare id: number;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare phone: string | null;
  declare subject: string;
  declare message: string;
  declare readonly createdAt: Date;
}

export const initContactModel = (sequelize: Sequelize): void => {
  Contact.init(
    {
      id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      firstName: { type: DataTypes.STRING(100), allowNull: false },
      lastName:  { type: DataTypes.STRING(100), allowNull: false },
      email:     { type: DataTypes.STRING(255), allowNull: false, validate: { isEmail: true } },
      phone:     { type: DataTypes.STRING(30),  allowNull: true },
      subject:   { type: DataTypes.ENUM('general','service','partnership','support','other'), allowNull: false },
      message:   { type: DataTypes.TEXT,        allowNull: false },
    },
    {
      sequelize,
      tableName: 'contacts',
      timestamps: true,
      updatedAt: false,
    }
  );
};