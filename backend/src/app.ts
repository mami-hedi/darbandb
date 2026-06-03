import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import { sequelize } from './config/database';
import { initReservationModel } from './models/Reservation';
import { initBlogPostModel } from './models/blogModel';
import { initAdminModel, Admin } from './models/Admin';
import { initCustomPriceModel } from './models/CustomPrice';
import { initRateRuleModel } from './models/RateRule';
import { initManualBlockModel } from './models/ManualBlock'; // ← AJOUT
import availabilityRoutes from './routes/Availability';
import reservationRoutes from './routes/reservations';
import blogRoutes from './routes/blogRoutes';
import authRoutes from './routes/authRoutes';
import priceRoutes from './routes/priceRoutes';
import rateRulesRouter from './routes/rateRules';

const app = express();

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://bnb-villa.com',       // ← nouveau domaine
  'https://www.bnb-villa.com',   // ← avec www
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('CORS Policy: Origin not allowed'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ── Modèles ───────────────────────────────────────────────────────────────────
initReservationModel(sequelize);
initBlogPostModel(sequelize);
initAdminModel(sequelize);
initCustomPriceModel(sequelize);
initRateRuleModel(sequelize);
initManualBlockModel(sequelize); // ← AJOUT

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/settings', priceRoutes);
app.use('/api/rates', rateRulesRouter);

// ── Seed admin par défaut ─────────────────────────────────────────────────────
const seedAdmin = async () => {
  const adminCount = await Admin.count();
  if (adminCount === 0) {
    await Admin.create({
      email: 'admin@dar-bb.com',
      password: 'Admin123',
    });
    console.log('👤 Compte admin par défaut créé : admin@dar-bb.com / Admin123');
  }
};

// ── Démarrage ─────────────────────────────────────────────────────────────────
export const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Base de données connectée');

    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés');

    await seedAdmin();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur prêt sur le port ${PORT}`);
      console.log(`📁 Images blog servies sur /assets/blogImages`);
    });
  } catch (error) {
    console.error('❌ Erreur de démarrage:', error);
    throw error;
  }
};

export default app;