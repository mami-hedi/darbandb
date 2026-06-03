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
  public specialRequests?: string;
  public source!: string;
  public status!: 'pending' | 'confirmed' | 'cancelled';

  // ── Nouveaux champs : paiement avance ──
  public depositAmount!: number;          // Montant de l'acompte demandé
  public depositPaid!: boolean;           // Acompte reçu ou non
  public depositPaidAt?: Date;            // Date de réception de l'acompte
  public depositNotes?: string;           // Notes libres sur le paiement

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initReservationModel = (sequelize: Sequelize) => {
  Reservation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      refNumber: {
  type: DataTypes.STRING,
  unique: 'reservations_refNumber_unique',  // nom fixe
  allowNull: false,
},
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName:  { type: DataTypes.STRING, allowNull: false },
      email:     { type: DataTypes.STRING, allowNull: false },
      phone:     { type: DataTypes.STRING, allowNull: true },
      checkInDate:  { type: DataTypes.DATE, allowNull: false },
      checkOutDate: { type: DataTypes.DATE, allowNull: false },
      numberOfGuests: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      specialRequests: { type: DataTypes.TEXT, allowNull: true },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'direct',
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        defaultValue: 'pending',
      },

      // ── Paiement / acompte ──
      depositAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Montant de l\'acompte demandé (ex : 30% du totalPrice)',
      },
      depositPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Vrai si l\'acompte a été encaissé',
      },
      depositPaidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de réception de l\'acompte',
      },
      depositNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notes libres sur le mode de paiement, référence virement, etc.',
      },
    },
    {
      sequelize,
      tableName: 'reservations',
      timestamps: true,
    }
  );

  return Reservation;
};