import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import { sequelize } from './config/database';

// Import des modèles et routes
import { initReservationModel } from './models/Reservation';
import { initBlogPostModel } from './models/blogModel';
import { initAdminModel, Admin } from './models/Admin';
import { initCustomPriceModel } from './models/CustomPrice';
import { initRateRuleModel } from './models/RateRule';
import { initManualBlockModel } from './models/ManualBlock';

import availabilityRoutes from './routes/Availability';
import reservationRoutes from './routes/reservations';
import blogRoutes from './routes/blogRoutes';
import authRoutes from './routes/authRoutes';
import priceRoutes from './routes/priceRoutes';
import rateRulesRouter from './routes/rateRules';

const app = express();
app.set('trust proxy', 1); // ← fix Render proxy

// Middlewares de sécurité et parsing
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://bnb-villa.com',
  'https://www.bnb-villa.com',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('CORS Policy: Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Routes publiques et statiques
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Initialisation des modèles
initReservationModel(sequelize);
initBlogPostModel(sequelize);
initAdminModel(sequelize);
initCustomPriceModel(sequelize);
initRateRuleModel(sequelize);
initManualBlockModel(sequelize);

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/settings', priceRoutes);
app.use('/api/rates', rateRulesRouter);

// Seed Admin (Sécurisé par variable d'environnement)
const seedAdmin = async () => {
  const adminCount = await Admin.count();
  if (adminCount === 0) {
    const password = process.env.INITIAL_ADMIN_PASSWORD || 'VotreMotDePasseSecret123';
    await Admin.create({
      email: 'experience@bnb-villa.com',
      password: password,
    });
    console.log('👤 Compte admin par défaut créé.');
  }
};

// Démarrage
export const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await seedAdmin();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Serveur prêt sur le port ${PORT}`));
  } catch (error) {
    console.error('❌ Erreur de démarrage:', error);
  }
};

export default app;