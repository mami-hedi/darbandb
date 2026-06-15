import { Request, Response } from 'express';
import { Notification } from '../models/Notification';

export class NotificationController {
  constructor() {
    this.getAll      = this.getAll.bind(this);
    this.markAllRead = this.markAllRead.bind(this);
    this.markOneRead = this.markOneRead.bind(this);
    this.deleteOne   = this.deleteOne.bind(this);
    this.deleteAll   = this.deleteAll.bind(this);
  }

  // GET /api/notifications — récupérer toutes les notifs
  async getAll(req: Request, res: Response) {
    try {
      const notifications = await Notification.findAll({
        order: [['createdAt', 'DESC']],
        limit: 50,
      });
      return res.json({ success: true, data: notifications });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // PATCH /api/notifications/read-all — tout marquer comme lu
  async markAllRead(req: Request, res: Response) {
    try {
      await Notification.update({ read: true }, { where: { read: false } });
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // PATCH /api/notifications/:id/read — marquer une notif comme lue
  async markOneRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await Notification.update({ read: true }, { where: { id } });
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/notifications/:id — supprimer une notif
  async deleteOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await Notification.destroy({ where: { id } });
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/notifications — vider toutes les notifs
  async deleteAll(req: Request, res: Response) {
    try {
      await Notification.destroy({ where: {} });
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}