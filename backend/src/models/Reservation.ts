import { Model, DataTypes, Sequelize } from 'sequelize';

export class Reservation extends Model {
  public id!: number;
  public refNumber!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public phone?: string;
  public checkInDate!: Date;
  public checkOutDate!: Date;
  public numberOfGuests!: number; // <-- Ajouté pour TypeScript
  public totalPrice!: number;
  public status!: 'pending' | 'confirmed' | 'cancelled';
}

export const initReservationModel = (sequelize: Sequelize) => {
  Reservation.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      refNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      phone: DataTypes.STRING,
      checkInDate: { type: DataTypes.DATE, allowNull: false },
      checkOutDate: { type: DataTypes.DATE, allowNull: false },
      totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      numberOfGuests: { // Le champ est bien là
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2
      },
      status: { 
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'), 
        defaultValue: 'pending' 
      },
    },
    { 
      sequelize, 
      tableName: 'reservations',
      timestamps: true 
    }
  );
  return Reservation;
};