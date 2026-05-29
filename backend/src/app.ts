import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import helmet from 'helmet'; 
import { sequelize } from './config/database';

// Import des modèles
import { initReservationModel } from './models/Reservation';
import { initBlogPostModel } from './models/blogModel';
import { initAdminModel, Admin } from './models/Admin'; 
import { initCustomPriceModel } from './models/CustomPrice';
import { initRateRuleModel } from './models/RateRule'; // ← AJOUT

// Import des routes
import availabilityRoutes from './routes/Availability';
import reservationRoutes from './routes/reservations';
import blogRoutes from './routes/blogRoutes';
import authRoutes from './routes/authRoutes'; 
import priceRoutes from './routes/priceRoutes';
import rateRulesRouter from './routes/rateRules';

const app = express();

// --- MIDDLEWARES DE SÉCURITÉ ---
app.use(helmet()); 
app.use(cookieParser()); 

// CONFIGURATION CORS
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use(cors({
  origin: allowedOrigin, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- INITIALISATION DES MODÈLES ---
initReservationModel(sequelize);
initBlogPostModel(sequelize);
initAdminModel(sequelize); 
initCustomPriceModel(sequelize);
initRateRuleModel(sequelize); // ← AJOUT

// --- DÉCLARATION DES ROUTES ---
app.use('/api/auth', authRoutes); 
app.use('/api/availability', availabilityRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/settings', priceRoutes); // ← CORRIGÉ : /api/settings (plus /api/rates)
app.use('/api/rates', rateRulesRouter); // ← CORRIGÉ : seul maître de /api/rates

// --- SEED ADMIN PAR DÉFAUT ---
const seedAdmin = async () => {
  const adminCount = await Admin.count();
  if (adminCount === 0) {
    await Admin.create({
      email: 'admin@dar-bb.com',
      password: 'Admin123' 
    });
    console.log('👤 Compte admin par défaut créé : admin@dar-bb.com / Admin123');
  }
};

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Base de données connectée');
    
    await sequelize.sync({ alter: true }); // crée/met à jour rate_rules automatiquement
    console.log('✅ Modèles synchronisés');

    await seedAdmin();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur prêt sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur de démarrage:', error);
  }
};

start();