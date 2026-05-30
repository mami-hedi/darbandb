"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const Admin_1 = require("../models/Admin");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. Chercher l'admin
        const admin = await Admin_1.Admin.findOne({ where: { email } });
        if (!admin) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }
        // 2. Vérifier le mot de passe
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }
        // 3. Générer le token JWT
        const token = jsonwebtoken_1.default.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET || 'secret_ultra_securise_123', { expiresIn: '2h' });
        // 4. Envoyer le token via un cookie sécurisé (HttpOnly)
        res.cookie('admin_token', token, {
            httpOnly: true, // Interdit l'accès via JS
            secure: process.env.NODE_ENV === 'production', // Uniquement en HTTPS en prod
            sameSite: 'strict', // Protection contre le CSRF
            maxAge: 2 * 60 * 60 * 1000 // 2 heures
        });
        return res.json({ success: true, message: "Connexion réussie" });
    }
    catch (error) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.login = login;
