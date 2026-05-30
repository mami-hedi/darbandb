"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// On applique le limiteur de 5 tentatives uniquement sur la route login
router.post('/login', rateLimiter_1.loginLimiter, authController_1.login);
// Route de déconnexion (efface le cookie)
router.post('/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
});
exports.default = router;
