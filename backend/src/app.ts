import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Importation de la configuration de la base de données (Sequelize)
// Note: Assure-toi d'avoir un fichier database.ts dans ton dossier config/ ou models/
// import { sequelize } from './config/database'; 

// Importation des routes (à adapter selon tes fichiers)
// import authRoutes from './routes/authRoutes';
// import bookingRoutes from './routes/bookingRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors()); // Autorise les requêtes depuis ton frontend React
app.use(morgan('dev')); // Log les requêtes dans la console
app.use(express.json()); // Permet de lire le JSON dans le corps des requêtes (req.body)
app.use(express.urlencoded({ extended: true }));

// --- Dossier public pour les photos (Chambres, Oasis, etc.) ---
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- Routes de test ---
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Bienvenue sur l'API de Hammamet Oasis (DarB&B)" });
});

// --- Routes API ---
// app.use('/api/auth', authRoutes);
// app.use('/api/bookings', bookingRoutes);

// --- Gestion des erreurs 404 ---
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route introuvable" });
});

// --- Lancement du serveur ---
const startServer = async () => {
  try {
    // Authentification avec la DB si tu utilises Sequelize
    // await sequelize.authenticate();
    // console.log('✅ Connexion à MySQL établie avec succès.');

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur : http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur :', error);
    process.exit(1);
  }
};

startServer();

export default app;