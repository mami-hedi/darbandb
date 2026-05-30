"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const blogModel_1 = require("../models/blogModel");
class BlogService {
    static async getAllPosts() {
        return await blogModel_1.BlogPost.findAll({ order: [['createdAt', 'DESC']] });
    }
    static async getPostBySlug(slug) {
        return await blogModel_1.BlogPost.findOne({ where: { slug } });
    }
    static async createPost(data) {
        // Génération automatique d'un slug si non présent
        if (!data.slug) {
            data.slug = data.title.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
        }
        return await blogModel_1.BlogPost.create(data);
    }
    static async updatePost(id, data) {
        const post = await blogModel_1.BlogPost.findByPk(id);
        if (!post)
            throw new Error("Article introuvable");
        return await post.update(data);
    }
    static async deletePost(id) {
        const post = await blogModel_1.BlogPost.findByPk(id);
        if (!post)
            throw new Error("Article introuvable");
        return await post.destroy();
    }
}
exports.BlogService = BlogService;
