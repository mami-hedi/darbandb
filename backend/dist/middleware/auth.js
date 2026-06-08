"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    // Récupération du token depuis les cookies
    const token = req.cookies.admin_token;
    if (!token) {
        return res.status(401).json({ message: "Accès non autorisé : aucun token fourni" });
    }
    try {
        // Vérification du token avec votre secret
        const secret = process.env.JWT_SECRET || 'secret_ultra_securise_123';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Injection de l'id de l'admin dans l'objet req
        req.admin = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: "Token invalide ou expiré" });
    }
};
exports.authenticateToken = authenticateToken;
