import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { sequelize } from './config/database';
import { initReservationModel } from './models/Reservation';
import { initBlogPostModel } from './models/blogModel';
import { initAdminModel, Admin } from './models/Admin';
import { initCustomPriceModel } from './models/CustomPrice';
import { initRateRuleModel } from './models/RateRule';
import availabilityRoutes from './routes/Availability';
import reservationRoutes from './routes/reservations';
import blogRoutes from './routes/blogRoutes';
import authRoutes from './routes/authRoutes';
import priceRoutes from './routes/priceRoutes';
import rateRulesRouter from './routes/rateRules';

const app = express();

app.use(helmet());
app.use(cookieParser());

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initReservationModel(sequelize);
initBlogPostModel(sequelize);
initAdminModel(sequelize);
initCustomPriceModel(sequelize);
initRateRuleModel(sequelize);

app.use('/api/auth', authRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/settings', priceRoutes);
app.use('/api/rates', rateRulesRouter);

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
    });
  } catch (error) {
    console.error('❌ Erreur de démarrage:', error);
    throw error;
  }
};

export default app;