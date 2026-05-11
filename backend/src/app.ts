import express from 'express';
import { sequelize } from './config/database';
import { initReservationModel } from './models/Reservation';
import availabilityRoutes from './routes/availability';

const app = express();
app.use(express.json());

// 1. Initialisation des modèles avec l'instance Sequelize
initReservationModel(sequelize);

// 2. Routes
app.use('/api/availability', availabilityRoutes);

// 3. Démarrage sécurisé
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Base de données connectée (XAMPP)');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés');

    app.listen(5000, () => {
      console.log('🚀 Serveur prêt sur http://localhost:5000');
    });
  } catch (error) {
    console.error('❌ Erreur de démarrage:', error);
  }
};

start();