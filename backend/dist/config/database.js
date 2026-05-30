"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
let sequelize;
if (process.env.DATABASE_URL) {
    // === CONFIGURATION PRODUCTION (Render + Aiven) ===
    exports.sequelize = sequelize = new sequelize_1.Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        logging: false,
        define: {
            timestamps: true,
        },
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Obligatoire pour la sécurité d'Aiven
            }
        }
    });
}
else {
    // === CONFIGURATION LOCALE (XAMPP) ===
    exports.sequelize = sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || 'darbandb', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        port: Number(process.env.DB_PORT) || 3306,
        logging: false,
        define: {
            timestamps: true,
        }
    });
}
// Test de connexion automatique selon l'environnement
sequelize.authenticate()
    .then(() => {
    const mode = process.env.DATABASE_URL ? 'Aiven (Production)' : 'XAMPP (Local)';
    console.log(`✅ Connexion MySQL réussie avec ${mode} !`);
})
    .catch((err) => {
    console.error('❌ Impossible de se connecter à MySQL:', err);
});
