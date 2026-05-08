import { Request, Response } from 'express';
import { BlogPost } from '../models/BlogPost';

export class BlogController {
  
  // GET - Articles publics
  async getPublishedPosts(req: Request, res: Response) {
    try {
      const posts = await BlogPost.findAll({
        where: { status: 'published' },
        order: [['publishedAt', 'DESC']],
      });
      res.json({ success: true, data: posts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST - Créer un article (Admin)
  async createPost(req: Request, res: Response) {
    try {
      const { title, excerpt, content, image, status } = req.body;
      const slug = title.toLowerCase().replace(/\s+/g, '-');

      const post = await BlogPost.create({
        title,
        slug,
        excerpt,
        content,
        image,
        status,
        author: req.user!.id,
        publishedAt: status === 'published' ? new Date() : null,
      });

      res.status(201).json({ success: true, data: post });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT - Mettre à jour (Admin)
  async updatePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, excerpt, content, image, status } = req.body;
      const slug = title.toLowerCase().replace(/\s+/g, '-');

      const post = await BlogPost.findByPk(id);
      if (!post) return res.status(404).json({ success: false, error: 'Article non trouvé' });

      await post.update({
        title,
        slug,
        excerpt,
        content,
        image,
        status,
        publishedAt: status === 'published' && !post.publishedAt ? new Date() : post.publishedAt,
      });

      res.json({ success: true, data: post });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE - Supprimer un article
  async deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await BlogPost.destroy({ where: { id } });
      res.json({ success: true, message: 'Article supprimé' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}