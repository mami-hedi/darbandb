import { Model, DataTypes, Sequelize } from 'sequelize';

export class AirbnbBlock extends Model {
  public id!: number;
  public uid!: string;
  public startDate!: string;
  public endDate!: string;
  public summary!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initAirbnbBlockModel = (sequelize: Sequelize) => {
  AirbnbBlock.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uid: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: 'airbnb_blocks_uid_unique', // ← nom fixe, évite les index dupliqués
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'start_date',
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'end_date',
      },
      summary: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'airbnb_blocks',
      timestamps: true, // createdAt / updatedAt gérés automatiquement
      indexes: [{ fields: ['start_date', 'end_date'] }],
    }
  );
  return AirbnbBlock;
};