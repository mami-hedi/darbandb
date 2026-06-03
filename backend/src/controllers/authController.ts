import { Request, Response } from 'express';
import { Admin } from '../models/Admin';
import jwt from 'jsonwebtoken';

const isProd = process.env.NODE_ENV === 'production';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { id: admin.id, role: 'admin' },
      process.env.JWT_SECRET || 'secret_ultra_securise_123',
      { expiresIn: '2h' }
    );

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: isProd,                          // HTTPS uniquement en prod
      sameSite: isProd ? 'none' : 'strict',   // 'none' obligatoire cross-domain en prod
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Connexion réussie" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};