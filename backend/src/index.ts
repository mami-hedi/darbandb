// ============================================
// POINT D'ENTRÉE: src/index.ts
// Copiez ce fichier dans src/index.ts
// ============================================

import { startServer } from './app';

// Démarrer le serveur
startServer().catch((error) => {
  console.error('❌ Erreur fatale au démarrage:', error);
  process.exit(1);
});

// Gestion des signaux d'arrêt (Ctrl+C)
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM reçu. Arrêt gracieux du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT reçu (Ctrl+C). Arrêt gracieux du serveur...');
  process.exit(0);
});