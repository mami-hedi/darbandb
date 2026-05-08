import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Reservation extends Model {
  public id!: number;
  public refNumber!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public phone?: string;
  public nationality?: string;
  public numberOfGuests!: number;
  public checkInDate!: Date;
  public checkOutDate!: Date;
  public totalPrice!: number;
  public source!: 'direct' | 'airbnb';
  public status!: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  public specialRequests?: string;
  public notes?: string;
  public airbnbReservationId?: string;
  public reminderSent!: boolean;
  public reminderSentAt?: Date;
}

Reservation.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    refNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: DataTypes.STRING,
    nationality: DataTypes.STRING,
    numberOfGuests: { type: DataTypes.INTEGER, allowNull: false },
    checkInDate: { type: DataTypes.DATE, allowNull: false },
    checkOutDate: { type: DataTypes.DATE, allowNull: false },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    source: { type: DataTypes.ENUM('direct', 'airbnb'), defaultValue: 'direct' },
    status: { type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'), defaultValue: 'pending' },
    specialRequests: DataTypes.TEXT,
    notes: DataTypes.TEXT,
    airbnbReservationId: DataTypes.STRING,
    reminderSent: { type: DataTypes.BOOLEAN, defaultValue: false },
    reminderSentAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'reservations' }
);