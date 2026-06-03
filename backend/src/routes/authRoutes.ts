import { Router } from 'express';
import { login } from '../controllers/authController';
import { loginLimiter } from '../middleware/rateLimiter';
import { authenticateToken } from '../middleware/auth'; // Assurez-vous que le chemin est correct
import { Admin } from '../models/Admin';

// 1. Déclarez le routeur D'ABORD
const router = Router();

// 2. Définissez vos routes sur cette instance
router.post('/login', loginLimiter, login);

router.post('/logout', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
  });
  res.json({ success: true });
});

router.put('/update-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findByPk((req as any).admin.id);
    if (!admin) return res.status(404).json({ message: "Admin introuvable" });

    // Vérifier l'ancien mot de passe
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe actuel incorrect." });

    admin.password = newPassword;
    await admin.save(); // ← le hook beforeUpdate hache automatiquement
    res.json({ success: true, message: "Mot de passe mis à jour" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({ success: true });
});


// 3. Exportez le routeur à la fin
export default router;