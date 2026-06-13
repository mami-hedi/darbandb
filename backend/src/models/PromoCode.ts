import { Model, DataTypes, Sequelize } from 'sequelize';

export class PromoCode extends Model {
  public id!: number;
  public code!: string;
  public pct!: number;
  public description!: string | null;
  public expiresAt!: Date | null;
  public maxUses!: number | null;
  public usedCount!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initPromoCodeModel = (sequelize: Sequelize) => {
  PromoCode.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: 'promo_codes_code_unique',
        set(val: string) {
          this.setDataValue('code', val.toUpperCase().trim());
        },
      },
      pct: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        validate: { min: 1, max: 100 },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'expires_at',
      },
      maxUses: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        field: 'max_uses',
      },
      usedCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: 'used_count',
      },
    },
    {
      sequelize,
      tableName: 'promo_codes',
      timestamps: true,
      underscored: true,
    }
  );

  return PromoCode;
};