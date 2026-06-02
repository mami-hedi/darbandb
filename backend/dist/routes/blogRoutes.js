"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const blogModel_1 = require("../models/blogModel");
const router = (0, express_1.Router)();
// ── Configuation Multer ──────────────────────────────────────────────────────
// Dossier de destination : src/assets/blogImages (créé automatiquement)
const uploadDir = path_1.default.join(__dirname, '..', 'assets', 'blogImages');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        // Nom unique : timestamp + extension d'origine
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const uniqueName = `blog-${Date.now()}${ext}`;
        cb(null, uniqueName);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
});
// ── Route upload image ────────────────────────────────────────────────────────
// POST /api/blog/upload-image
// Retourne : { path: "/assets/blogImages/blog-1234567890.jpg" }
router.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier reçu.' });
    }
    // Chemin accessible depuis le frontend (servi comme fichier statique)
    const publicPath = `/assets/blogImages/${req.file.filename}`;
    res.json({ path: publicPath });
});
// ── CRUD Articles ─────────────────────────────────────────────────────────────
// GET /api/blog — Tous les articles
router.get('/', async (_req, res) => {
    try {
        const posts = await blogModel_1.BlogPost.findAll({ order: [['createdAt', 'DESC']] });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des articles', error: error.message });
    }
});
// GET /api/blog/:slug — Un article par slug (Vitrine)
router.get('/:slug', async (req, res) => {
    try {
        const post = await blogModel_1.BlogPost.findOne({ where: { slug: req.params.slug } });
        if (!post)
            return res.status(404).json({ message: 'Article non trouvé' });
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/blog — Créer un article
router.post('/', async (req, res) => {
    try {
        const newPost = await blogModel_1.BlogPost.create(req.body);
        res.status(201).json(newPost);
    }
    catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Ce slug est déjà utilisé par un autre article.' });
        }
        res.status(400).json({ message: error.message });
    }
});
// PUT /api/blog/:id — Mettre à jour un article
router.put('/:id', async (req, res) => {
    try {
        const post = await blogModel_1.BlogPost.findByPk(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Article introuvable' });
        await post.update(req.body);
        res.json(post);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// DELETE /api/blog/:id — Supprimer un article
router.delete('/:id', async (req, res) => {
    try {
        const post = await blogModel_1.BlogPost.findByPk(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Article introuvable' });
        // Supprimer l'image locale si elle est dans assets/blogImages
        if (post.cover && post.cover.startsWith('/assets/blogImages/')) {
            const imgPath = path_1.default.join(__dirname, '..', post.cover);
            if (fs_1.default.existsSync(imgPath))
                fs_1.default.unlinkSync(imgPath);
        }
        await post.destroy();
        res.json({ message: 'Article supprimé avec succès' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
