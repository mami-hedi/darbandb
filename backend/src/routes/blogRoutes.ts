import { Router } from 'express';
import { BlogPost } from '../models/blogModel';

const router = Router();

// RÉCUPÉRER TOUS LES ARTICLES (Admin + Vitrine)
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de la récupération des articles", error: error.message });
  }
});

// RÉCUPÉRER UN ARTICLE PAR SON SLUG (Vitrine)
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ where: { slug: req.params.slug } });
    if (!post) return res.status(404).json({ message: "Article non trouvé" });
    res.json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CRÉER UN NOUVEL ARTICLE (Admin)
router.post('/', async (req, res) => {
  try {
    const newPost = await BlogPost.create(req.body);
    res.status(201).json(newPost);
  } catch (error: any) {
    // Gestion de l'erreur si le slug existe déjà
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Ce slug est déjà utilisé par un autre article." });
    }
    res.status(400).json({ message: error.message });
  }
});

// METTRE À JOUR UN ARTICLE (Admin)
router.put('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Article introuvable" });

    await post.update(req.body);
    res.json(post);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// SUPPRIMER UN ARTICLE (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: "Article introuvable" });

    await post.destroy();
    res.json({ message: "Article supprimé avec succès" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;