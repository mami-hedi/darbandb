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
const path_1 = __importDefault(require("path"));
const database_1 = require("./config/database");
// Import des modèles et routes
const Reservation_1 = require("./models/Reservation");
const blogModel_1 = require("./models/blogModel");
const Admin_1 = require("./models/Admin");
const CustomPrice_1 = require("./models/CustomPrice");
const RateRule_1 = require("./models/RateRule");
const ManualBlock_1 = require("./models/ManualBlock");
require("./services/whatsappService");
const Availability_1 = __importDefault(require("./routes/Availability"));
const reservations_1 = __importDefault(require("./routes/reservations"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const priceRoutes_1 = __importDefault(require("./routes/priceRoutes"));
const rateRules_1 = __importDefault(require("./routes/rateRules"));
const app = (0, express_1.default)();
app.set('trust proxy', 1); // ← fix Render proxy
// Middlewares de sécurité et parsing
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Configuration CORS
const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://bnb-villa.com',
    'https://www.bnb-villa.com',
    process.env.FRONTEND_URL
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin))
            callback(null, true);
        else
            callback(new Error('CORS Policy: Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
// Routes publiques et statiques
app.use('/assets', express_1.default.static(path_1.default.join(__dirname, 'assets')));
// Initialisation des modèles
(0, Reservation_1.initReservationModel)(database_1.sequelize);
(0, blogModel_1.initBlogPostModel)(database_1.sequelize);
(0, Admin_1.initAdminModel)(database_1.sequelize);
(0, CustomPrice_1.initCustomPriceModel)(database_1.sequelize);
(0, RateRule_1.initRateRuleModel)(database_1.sequelize);
(0, ManualBlock_1.initManualBlockModel)(database_1.sequelize);
// Routes API
app.use('/api/auth', authRoutes_1.default);
app.use('/api/availability', Availability_1.default);
app.use('/api/reservations', reservations_1.default);
app.use('/api/blog', blogRoutes_1.default);
app.use('/api/settings', priceRoutes_1.default);
app.use('/api/rates', rateRules_1.default);
// Seed Admin (Sécurisé par variable d'environnement)
const seedAdmin = async () => {
    const adminCount = await Admin_1.Admin.count();
    if (adminCount === 0) {
        const password = process.env.INITIAL_ADMIN_PASSWORD || 'VotreMotDePasseSecret123';
        await Admin_1.Admin.create({
            email: 'experience@bnb-villa.com',
            password: password,
        });
        console.log('👤 Compte admin par défaut créé.');
    }
};
// Démarrage
const startServer = async () => {
    try {
        await database_1.sequelize.authenticate();
        await database_1.sequelize.sync({ alter: true });
        await seedAdmin();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Serveur prêt sur le port ${PORT}`));
    }
    catch (error) {
        console.error('❌ Erreur de démarrage:', error);
    }
};
exports.startServer = startServer;
exports.default = app;
