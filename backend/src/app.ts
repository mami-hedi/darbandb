import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // <-- INDISPENSABLE pour les cookies sécurisés
import helmet from 'helmet'; // <-- AJOUT SÉCURITÉ (Headers HTTP)
import { sequelize } from './config/database';

// Import des modèles
import { initReservationModel } from './models/Reservation';
import { initBlogPostModel } from './models/blogModel';
import { initAdminModel, Admin } from './models/Admin'; // <-- AJOUT ICI

// Import des routes
import availabilityRoutes from './routes/availability';
import reservationRoutes from './routes/reservations';
import blogRoutes from './routes/blogRoutes';
import authRoutes from './routes/authRoutes'; // <-- AJOUT ICI

const app = express();

// --- MIDDLEWARES DE SÉCURITÉ ---
app.use(helmet()); // Protège contre diverses failles (XSS, Clickjacking)
app.use(cookieParser()); // Permet au serveur de lire les cookies admin_token

// CONFIGURATION CORS MISE À JOUR
app.use(cors({
  origin: 'http://localhost:8080', // Ton frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // INDISPENSABLE pour accepter les cookies du front
}));

app.use(express.json());

// --- INITIALISATION DES MODÈLES ---
// On garde l'initialisation ici pour que Sequelize enregistre les schémas
initReservationModel(sequelize);
initBlogPostModel(sequelize);
initAdminModel(sequelize); // <-- Initialise la table admins

// --- DÉCLARATION DES ROUTES ---
app.use('/api/auth', authRoutes); // <-- Nouvelles routes login/logout
app.use('/api/availability', availabilityRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/blog', blogRoutes);

// --- FONCTION DE CRÉATION DE L'ADMIN PAR DÉFAUT ---
const seedAdmin = async () => {
  // On s'assure que le modèle est bien rattaché à Sequelize avant la requête
  const adminCount = await Admin.count();
  if (adminCount === 0) {
    await Admin.create({
      email: 'admin@dar-bb.com',
      password: 'Admin123' // Sera haché automatiquement par le hook mis à jour
    });
    console.log('👤 Compte admin par défaut créé : admin@dar-bb.com / Admin123');
  }
};

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Base de données connectée (XAMPP)');
    
    // Synchronisation des tables (Ajoute les colonnes manquantes comme 'source' ou 'password')
    // C'est à ce moment précis que Sequelize fige les modèles en BDD !
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés');

    // On crée l'admin SEULEMENT après que la synchronisation complète est achevée
    await seedAdmin();

    app.listen(5000, () => {
      console.log('🚀 Serveur prêt sur http://localhost:5000');
      console.log('📡 Routes actives: /api/auth, /api/availability, /api/reservations, /api/blog');
    });
  } catch (error) {
    console.error('❌ Erreur de démarrage:', error);
  }
};

start();