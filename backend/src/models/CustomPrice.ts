import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export class CustomPrice extends Model<InferAttributes<CustomPrice>, InferCreationAttributes<CustomPrice>> {
  declare specificDate: string;
  declare price: number;
}

export const initCustomPriceModel = (sequelize: Sequelize) => {
  CustomPrice.init(
    {
      specificDate: {
        // Changement vers STRING pour un contrôle total du format 'YYYY-MM-DD'
        // et éviter les conversions automatiques de fuseaux horaires
        type: DataTypes.STRING(10), 
        primaryKey: true,
        allowNull: false,
        field: 'specific_date',
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        // Getter personnalisé pour forcer le retour en Number (et pas en String/Decimal)
        get() {
          const rawValue = this.getDataValue('price');
          return rawValue !== null ? parseFloat(rawValue.toString()) : 0;
        }
      },
    },
    {
      sequelize,
      tableName: 'custom_prices',
      timestamps: false,
    }
  );
};