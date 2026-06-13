import { Request, Response } from 'express';
import { Subscriber } from '../models/Subscriber';

export class SubscriberController {
  constructor() {
    this.getAll     = this.getAll.bind(this);
    this.subscribe  = this.subscribe.bind(this);
    this.remove     = this.remove.bind(this);
    this.export     = this.export.bind(this);
  }

  // GET /api/subscribers — admin : liste tous les abonnés
  async getAll(req: Request, res: Response) {
    try {
      const subscribers = await Subscriber.findAll({
        order: [['createdAt', 'DESC']],
      });
      return res.json({ success: true, data: subscribers });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/subscribers — public : s'abonner
  async subscribe(req: Request, res: Response) {
    try {
      const { email, lang = 'fr' } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: 'Email requis.' });
      }

      // Vérifier si déjà abonné
      const existing = await Subscriber.findOne({
        where: { email: email.trim().toLowerCase() },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Cet email est déjà abonné.',
        });
      }

      const subscriber = await Subscriber.create({ email, lang });

      return res.status(201).json({ success: true, data: subscriber });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/subscribers/:id — admin : supprimer un abonné
  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const subscriber = await Subscriber.findByPk(id);

      if (!subscriber) {
        return res.status(404).json({ success: false, message: 'Abonné introuvable.' });
      }

      await subscriber.destroy();
      return res.json({ success: true, message: 'Abonné supprimé.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/subscribers/export — admin : export CSV
  async export(req: Request, res: Response) {
    try {
      const subscribers = await Subscriber.findAll({
        order: [['createdAt', 'DESC']],
        attributes: ['email', 'lang', 'createdAt'],
      });

      const csv = [
        'email,lang,date',
        ...subscribers.map((s: any) =>
          `${s.email},${s.lang},${new Date(s.createdAt).toLocaleDateString('fr-FR')}`
        ),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="abonnes.csv"');
      return res.send('\uFEFF' + csv); // BOM pour Excel
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}