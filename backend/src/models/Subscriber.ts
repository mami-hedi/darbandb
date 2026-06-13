import { Model, DataTypes, Sequelize } from 'sequelize';

export class Subscriber extends Model {
  public id!: number;
  public email!: string;
  public lang!: 'fr' | 'en';
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initSubscriberModel = (sequelize: Sequelize) => {
  Subscriber.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: 'subscribers_email_unique',
        validate: { isEmail: true },
        set(val: string) {
          this.setDataValue('email', val.trim().toLowerCase());
        },
      },
      lang: {
        type: DataTypes.ENUM('fr', 'en'),
        allowNull: false,
        defaultValue: 'fr',
      },
    },
    {
      sequelize,
      tableName: 'subscribers',
      timestamps: true,
      underscored: true,
    }
  );

  return Subscriber;
};