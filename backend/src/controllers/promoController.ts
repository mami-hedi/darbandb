import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { PromoCode } from '../models/PromoCode';

export class PromoController {
  constructor() {
    this.getAll     = this.getAll.bind(this);
    this.create     = this.create.bind(this);
    this.remove     = this.remove.bind(this);
    this.validate   = this.validate.bind(this);
    this.applyUsage = this.applyUsage.bind(this);
  }

  // ─── GET /api/promos ──────────────────────────────────────────
  // Liste tous les codes (admin)
  async getAll(req: Request, res: Response) {
    try {
      const promos = await PromoCode.findAll({
        order: [['createdAt', 'DESC']],
      });
      return res.json({ success: true, data: promos });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ─── POST /api/promos ─────────────────────────────────────────
  // Créer un nouveau code promo
  async create(req: Request, res: Response) {
    try {
      const { code, pct, description, expiresAt, maxUses } = req.body;

      // Validation
      if (!code || !pct) {
        return res.status(400).json({
          success: false,
          message: 'Le code et le pourcentage sont requis.',
        });
      }
      if (pct < 1 || pct > 100) {
        return res.status(400).json({
          success: false,
          message: 'Le pourcentage doit être entre 1 et 100.',
        });
      }

      // Vérifier unicité
      const existing = await PromoCode.findOne({
        where: { code: code.toUpperCase().trim() },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Le code "${code.toUpperCase()}" existe déjà.`,
        });
      }

      const promo = await PromoCode.create({
        code,
        pct: Number(pct),
        description: description || null,
        expiresAt:   expiresAt   || null,
        maxUses:     maxUses ? Number(maxUses) : null,
        usedCount:   0,
      });

      return res.status(201).json({ success: true, data: promo });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ─── DELETE /api/promos/:id ───────────────────────────────────
  // Supprimer un code
  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const promo = await PromoCode.findByPk(id);

      if (!promo) {
        return res.status(404).json({ success: false, message: 'Code promo introuvable.' });
      }

      await promo.destroy();
      return res.json({ success: true, message: 'Code supprimé.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ─── POST /api/promos/validate ────────────────────────────────
  // Valider un code côté client (formulaire de réservation)
  async validate(req: Request, res: Response) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ success: false, message: 'Code requis.' });
      }

      const promo = await PromoCode.findOne({
        where: { code: code.toUpperCase().trim() },
      });

      // Code inexistant
      if (!promo) {
        return res.status(404).json({ success: false, message: 'Code promo invalide.' });
      }

      // Expiré
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        return res.status(410).json({ success: false, message: 'Ce code promo a expiré.' });
      }

      // Épuisé
      if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
        return res.status(410).json({
          success: false,
          message: 'Ce code promo a atteint son nombre maximum d\'utilisations.',
        });
      }

      // ✅ Valide
      return res.json({
        success: true,
        data: {
          code:        promo.code,
          pct:         promo.pct,
          description: promo.description,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ─── POST /api/promos/apply ───────────────────────────────────
  // Incrémenter usedCount après une réservation confirmée
  async applyUsage(req: Request, res: Response) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ success: false, message: 'Code requis.' });
      }

      const promo = await PromoCode.findOne({
        where: { code: code.toUpperCase().trim() },
      });

      if (!promo) {
        return res.status(404).json({ success: false, message: 'Code introuvable.' });
      }

      await promo.increment('usedCount');

      return res.json({ success: true, message: 'Usage enregistré.', usedCount: promo.usedCount + 1 });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}