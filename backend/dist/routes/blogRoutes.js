"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const blogModel_1 = require("../models/blogModel");
const router = (0, express_1.Router)();
// ── Configuration Cloudinary ─────────────────────────────────────────────────
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'darbandb/blog',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }],
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
// Retourne : { path: "https://res.cloudinary.com/..." }
router.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier reçu.' });
    }
    // Cloudinary retourne l'URL publique dans req.file.path
    const publicPath = req.file.path;
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
// DELETE /api/blog/:id — Supprimer un article + image Cloudinary
router.delete('/:id', async (req, res) => {
    try {
        const post = await blogModel_1.BlogPost.findByPk(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Article introuvable' });
        // Supprimer l'image sur Cloudinary si l'URL vient de Cloudinary
        if (post.cover && post.cover.includes('cloudinary.com')) {
            // Extraire le public_id depuis l'URL : "darbandb/blog/nom-fichier"
            const matches = post.cover.match(/darbandb\/blog\/([^/.]+)/);
            if (matches) {
                const publicId = `darbandb/blog/${matches[1]}`;
                await cloudinary_1.v2.uploader.destroy(publicId);
            }
        }
        await post.destroy();
        res.json({ message: 'Article supprimé avec succès' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
