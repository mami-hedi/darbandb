"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_1 = require("../middleware/auth"); // Assurez-vous que le chemin est correct
const Admin_1 = require("../models/Admin");
// 1. Déclarez le routeur D'ABORD
const router = (0, express_1.Router)();
// 2. Définissez vos routes sur cette instance
router.post('/login', rateLimiter_1.loginLimiter, authController_1.login);
router.post('/logout', (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('admin_token', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'strict',
    });
    res.json({ success: true });
});
router.put('/update-password', auth_1.authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await Admin_1.Admin.findByPk(req.admin.id);
        if (!admin)
            return res.status(404).json({ message: "Admin introuvable" });
        // Vérifier l'ancien mot de passe
        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch)
            return res.status(401).json({ message: "Mot de passe actuel incorrect." });
        admin.password = newPassword;
        await admin.save(); // ← le hook beforeUpdate hache automatiquement
        res.json({ success: true, message: "Mot de passe mis à jour" });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});
router.get('/me', auth_1.authenticateToken, (req, res) => {
    res.json({ success: true });
});
// 3. Exportez le routeur à la fin
exports.default = router;
