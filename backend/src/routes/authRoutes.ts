import { Router } from 'express';
import { login } from '../controllers/authController';
import { loginLimiter } from '../middleware/rateLimiter';

const router = Router();

// On applique le limiteur de 5 tentatives uniquement sur la route login
router.post('/login', loginLimiter, login);

// Route de déconnexion (efface le cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
});

export default router;