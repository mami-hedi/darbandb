import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Récupération du token depuis les cookies
  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ message: "Accès non autorisé : aucun token fourni" });
  }

  try {
    // Vérification du token avec votre secret
    const secret = process.env.JWT_SECRET || 'secret_ultra_securise_123';
    const decoded = jwt.verify(token, secret) as { id: number; role: string };
    
    // Injection de l'id de l'admin dans l'objet req
    (req as any).admin = decoded;
    
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
};