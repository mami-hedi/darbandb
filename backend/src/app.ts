import express from 'express';
import cors from 'cors';
import { sequelize } from './config/database';
import { initReservationModel } from './models/Reservation';

// 1. Importe les nouveaux fichiers de routes
import availabilityRoutes from './routes/availability';
import reservationRoutes from './routes/reservations'; // <-- AJOUT ICI

const app = express();

// 2. CONFIGURATION CORS
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 3. Middleware pour parser le JSON (Crucial pour le POST)
app.use(express.json());

// 4. Initialisation des modèles
initReservationModel(sequelize);

// 5. Routes
app.use('/api/availability', availabilityRoutes);
app.use('/api/reservations', reservationRoutes); // <-- AJOUT ICI (fait le lien avec /api/reservations)

// 6. Démarrage sécurisé
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Base de données connectée (XAMPP)');
    
    // Synchronisation des tables
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés');

    app.listen(5000, () => {
      console.log('🚀 Serveur prêt sur http://localhost:5000');
      console.log('📡 Routes actives: /api/availability et /api/reservations');
    });
  } catch (error) {
    console.error('❌ Erreur de démarrage:', error);
  }
};

start();