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
  public numberOfGuests!: number;
  public totalPrice!: number;
  public specialRequests?: string; // Ajouté pour correspondre au controller
  public source!: string;          // Ajouté pour les statistiques
  public status!: 'pending' | 'confirmed' | 'cancelled';

  // Timestamps (automatiques avec Sequelize)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initReservationModel = (sequelize: Sequelize) => {
  Reservation.init(
    {
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      refNumber: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false 
      },
      firstName: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      lastName: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      email: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      checkInDate: { 
        type: DataTypes.DATE, 
        allowNull: false 
      },
      checkOutDate: { 
        type: DataTypes.DATE, 
        allowNull: false 
      },
      numberOfGuests: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2
      },
      totalPrice: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false 
      },
      specialRequests: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'direct' // 'direct', 'airbnb', 'booking', etc.
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