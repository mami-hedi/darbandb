import { Model, DataTypes, Sequelize } from 'sequelize';

export class ManualBlock extends Model {
  public id!: number;
  public date!: string;           // Format YYYY-MM-DD
  public note!: string;
  public reason!: 'maintenance' | 'cleaning' | 'family' | 'other';
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initManualBlockModel = (sequelize: Sequelize) => {
  ManualBlock.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: DataTypes.DATEONLY,   // Stocke uniquement YYYY-MM-DD, sans heure
        allowNull: false,
        unique: true,               // Une seule entrée par date
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reason: {
        type: DataTypes.ENUM('maintenance', 'cleaning', 'family', 'other'),
        allowNull: false,
        defaultValue: 'other',
      },
    },
    {
      sequelize,
      tableName: 'manual_blocks',
      timestamps: true,
    }
  );

  return ManualBlock;
};