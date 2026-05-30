"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
(0, app_1.startServer)().catch((error) => {
    console.error('❌ Erreur fatale au démarrage:', error);
    process.exit(1);
});
process.on('SIGTERM', () => {
    console.log('\n⚠️  SIGTERM reçu. Arrêt gracieux du serveur...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT reçu (Ctrl+C). Arrêt gracieux du serveur...');
    process.exit(0);
});
