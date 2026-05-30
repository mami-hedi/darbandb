"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogController = void 0;
const blogModel_1 = require("../models/blogModel");
exports.blogController = {
    // Récupérer tous les articles (Admin + Public)
    getPosts: async (_req, res) => {
        try {
            const posts = await blogModel_1.BlogPost.findAll({
                order: [['createdAt', 'DESC']]
            });
            res.json(posts);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    // Création d'un article
    createPost: async (req, res) => {
        try {
            // Le body doit contenir title: {fr, en}, body: {fr, en}, cover, etc.
            const post = await blogModel_1.BlogPost.create(req.body);
            res.status(201).json(post);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    // Mise à jour complète
    updatePost: async (req, res) => {
        try {
            const { id } = req.params;
            const [updated] = await blogModel_1.BlogPost.update(req.body, { where: { id } });
            if (updated) {
                const updatedPost = await blogModel_1.BlogPost.findByPk(id);
                return res.json(updatedPost);
            }
            res.status(404).json({ message: "Article non trouvé" });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    // Suppression
    deletePost: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await blogModel_1.BlogPost.destroy({ where: { id } });
            if (deleted) {
                return res.status(204).send();
            }
            res.status(404).json({ message: "Article non trouvé" });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
