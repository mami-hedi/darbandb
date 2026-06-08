"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const Admin_1 = require("../models/Admin");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isProd = process.env.NODE_ENV === 'production';
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔐 Login attempt:', email); // ← log
        const admin = await Admin_1.Admin.findOne({ where: { email } });
        console.log('👤 Admin found:', admin ? 'oui' : 'non'); // ← log
        if (!admin) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }
        const isMatch = await admin.comparePassword(password);
        console.log('🔑 Password match:', isMatch); // ← log
        if (!isMatch) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }
        // ... reste du code
        const token = jsonwebtoken_1.default.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET || 'secret_ultra_securise_123', { expiresIn: '2h' });
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: isProd, // HTTPS uniquement en prod
            sameSite: isProd ? 'none' : 'strict', // 'none' obligatoire cross-domain en prod
            maxAge: 2 * 60 * 60 * 1000,
        });
        return res.json({ success: true, message: "Connexion réussie" });
    }
    catch (error) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.login = login;
