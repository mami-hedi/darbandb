// src/models/index.ts
import { sequelize } from '../config/database'; // Votre fichier actuel
import { initCustomPriceModel } from './CustomPrice';
import { initReservationModel } from './Reservation'; // Assurez-vous d'avoir une fonction init ici

// Initialiser les modèles
initCustomPriceModel(sequelize);
initReservationModel(sequelize);

// Synchronisation (si nécessaire)
// sequelize.sync(); 

export { sequelize };