import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import helmet from 'helmet'; 
import { sequelize } from './config/database';

// Import des modèles
import { initReservationModel } from './models/Reservation';
import { initBlogPostModel } from './models/blogModel';
import { initAdminModel, Admin } from './models/Admin'; 

// Import des routes
import availabilityRoutes from './routes/Availability';
import reservationRoutes from './routes/reservations';
import blogRoutes from './routes/blogRoutes';
import authRoutes from './routes/authRoutes'; 

const app = express();

// --- MIDDLEWARES DE SÉCURITÉ ---
app.use(helmet()); 
app.use(cookieParser()); 

// CONFIGURATION CORS DYNAMIQUE (Local vs Production Vercel)
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use(cors({
  origin: allowedOrigin, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
}));

app.use(express.json());

// --- INITIALISATION DES MODÈLES ---
initReservationModel(sequelize);
initBlogPostModel(sequelize);
initAdminModel(sequelize); 

// --- DÉCLARATION DES ROUTES ---
app.use('/api/auth', authRoutes); 
app.use('/api/availability', availabilityRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/blog', blogRoutes);

// --- FONCTION DE CRÉATION DE L'ADMIN PAR DÉFAUT ---
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
    console.log('✅ Base de données connectée (Aiven/Production)');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés');

    await seedAdmin();

    // RENDER REQUIERT IMPÉRATIVEMENT L'UTILISATION DE process.env.PORT
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur prêt sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur de démarrage:', error);
  }
};

start();