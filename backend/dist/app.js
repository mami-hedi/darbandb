"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const database_1 = require("./config/database");
// Import des modèles
const Reservation_1 = require("./models/Reservation");
const blogModel_1 = require("./models/blogModel");
const Admin_1 = require("./models/Admin");
const CustomPrice_1 = require("./models/CustomPrice");
const RateRule_1 = require("./models/RateRule");
// Import des routes
const Availability_1 = __importDefault(require("./routes/Availability"));
const reservations_1 = __importDefault(require("./routes/reservations"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const priceRoutes_1 = __importDefault(require("./routes/priceRoutes"));
const rateRules_1 = __importDefault(require("./routes/rateRules"));
const app = (0, express_1.default)();
// --- MIDDLEWARES DE SÉCURITÉ ---
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
// CONFIGURATION CORS
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use((0, cors_1.default)({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// --- INITIALISATION DES MODÈLES ---
(0, Reservation_1.initReservationModel)(database_1.sequelize);
(0, blogModel_1.initBlogPostModel)(database_1.sequelize);
(0, Admin_1.initAdminModel)(database_1.sequelize);
(0, CustomPrice_1.initCustomPriceModel)(database_1.sequelize);
(0, RateRule_1.initRateRuleModel)(database_1.sequelize);
// --- DÉCLARATION DES ROUTES ---
app.use('/api/auth', authRoutes_1.default);
app.use('/api/availability', Availability_1.default);
app.use('/api/reservations', reservations_1.default);
app.use('/api/blog', blogRoutes_1.default);
app.use('/api/settings', priceRoutes_1.default);
app.use('/api/rates', rateRules_1.default);
// --- SEED ADMIN PAR DÉFAUT ---
const seedAdmin = async () => {
    const adminCount = await Admin_1.Admin.count();
    if (adminCount === 0) {
        await Admin_1.Admin.create({
            email: 'admin@dar-bb.com',
            password: 'Admin123',
        });
        console.log('👤 Compte admin par défaut créé : admin@dar-bb.com / Admin123');
    }
};
// --- DÉMARRAGE SERVEUR ---
const startServer = async () => {
    try {
        await database_1.sequelize.authenticate();
        console.log('✅ Base de données connectée');
        await database_1.sequelize.sync({ alter: true });
        console.log('✅ Modèles synchronisés');
        await seedAdmin();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Serveur prêt sur le port ${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Erreur de démarrage:', error);
        throw error;
    }
};
exports.startServer = startServer;
exports.default = app;
