import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export class AuthController {
  
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ success: false, error: 'Identifiants invalides' });
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Identifiants invalides' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.json({ success: true, token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}