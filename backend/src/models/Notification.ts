import { Model, DataTypes, Sequelize } from 'sequelize';

export class Notification extends Model {
  public id!: number;
  public guestName!: string | null;
  public checkIn!: string | null;
  public checkOut!: string | null;
  public guests!: number | null;
  public status!: string | null;
  public read!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initNotificationModel = (sequelize: Sequelize) => {
  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      guestName: {
        type: DataTypes.STRING(150),
        allowNull: true,
        field: 'guest_name',
      },
      checkIn: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'check_in',
      },
      checkOut: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'check_out',
      },
      guests: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'En attente',
      },
      read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'notifications',
      timestamps: true,
      underscored: true,
    }
  );

  return Notification;
};