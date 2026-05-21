import { BlogPost } from '../models/blogModel';

export class BlogService {
  static async getAllPosts() {
    return await BlogPost.findAll({ order: [['createdAt', 'DESC']] });
  }

  static async getPostBySlug(slug: string) {
    return await BlogPost.findOne({ where: { slug } });
  }

  static async createPost(data: any) {
    // Génération automatique d'un slug si non présent
    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
    }
    return await BlogPost.create(data);
  }

  static async updatePost(id: number, data: any) {
    const post = await BlogPost.findByPk(id);
    if (!post) throw new Error("Article introuvable");
    return await post.update(data);
  }

  static async deletePost(id: number) {
    const post = await BlogPost.findByPk(id);
    if (!post) throw new Error("Article introuvable");
    return await post.destroy();
  }
}