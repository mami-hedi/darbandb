import { DataTypes, Model, Sequelize } from 'sequelize';

export interface RateRuleAttributes {
  id?: number;
  name: string;
  basePrice: number;
  startDate?: string | null;
  endDate?: string | null;
  daysOfWeek: string; // Stocké en JSON string : "[0,1,2,3,4,5,6]"
  isActive: boolean;
}

export class RateRule extends Model<RateRuleAttributes> 
  implements RateRuleAttributes {
  public id!: number;
  public name!: string;
  public basePrice!: number;
  public startDate!: string | null;
  public endDate!: string | null;
  public daysOfWeek!: string;
  public isActive!: boolean;
}

export const initRateRuleModel = (sequelize: Sequelize) => {
  RateRule.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'base_price',
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'start_date',
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'end_date',
      },
      daysOfWeek: {
        type: DataTypes.STRING(20), // ex: "0,1,2,3,4,5,6"
        allowNull: false,
        field: 'days_of_week',
      },
      isActive: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        field: 'is_active',
      },
    },
    {
      sequelize,
      tableName: 'rate_rules',
      timestamps: false,
    }
  );
};