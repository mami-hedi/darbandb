import { Sequelize } from 'sequelize';

// Remplace 'nom_de_ta_base' par le nom que tu as mis dans phpMyAdmin
export const sequelize = new Sequelize('darbandb', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306, // Port par défaut de XAMPP
  logging: false, 
  define: {
    timestamps: true,
  }
});

// Test de connexion rapide
sequelize.authenticate()
  .then(() => console.log('✅ Connexion MySQL réussie avec XAMPP !'))
  .catch((err) => console.error('❌ Impossible de se connecter à MySQL:', err));