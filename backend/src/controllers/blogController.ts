import { Request, Response } from 'express';
import { BlogPost } from '../models/blogModel';

export const blogController = {
  // Récupérer tous les articles (Admin + Public)
  getPosts: async (_req: Request, res: Response) => {
    try {
      const posts = await BlogPost.findAll({ 
        order: [['createdAt', 'DESC']] 
      });
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // Création d'un article
  createPost: async (req: Request, res: Response) => {
    try {
      // Le body doit contenir title: {fr, en}, body: {fr, en}, cover, etc.
      const post = await BlogPost.create(req.body);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // Mise à jour complète
  updatePost: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [updated] = await BlogPost.update(req.body, { where: { id } });
      if (updated) {
        const updatedPost = await BlogPost.findByPk(id);
        return res.json(updatedPost);
      }
      res.status(404).json({ message: "Article non trouvé" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  // Suppression
  deletePost: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await BlogPost.destroy({ where: { id } });
      if (deleted) {
        return res.status(204).send();
      }
      res.status(404).json({ message: "Article non trouvé" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
};