// ============================================
// Contrôleur de prix Express corrigé
// Fichier : priceController.ts
// ============================================

import { Request, Response } from 'express';
import { CustomPrice } from '../models/CustomPrice';

export class PriceController {
  constructor() {
    this.getAllPrices       = this.getAllPrices.bind(this);
    this.updateCustomPrice  = this.updateCustomPrice.bind(this);
    this.deleteCustomPrice  = this.deleteCustomPrice.bind(this);
    this.getPricesByRange   = this.getPricesByRange.bind(this);
    // AJOUTS ICI
    this.getBasePrice       = this.getBasePrice.bind(this);
    this.updateBasePrice    = this.updateBasePrice.bind(this);
  }

  // --- Vos méthodes existantes ---
  async getAllPrices(req: Request, res: Response) {
    try {
      const prices = await CustomPrice.findAll();
      const customPrices: Record<string, number> = {};
      prices.forEach((row) => {
        const dateKey = row.getDataValue('specificDate');
        if (dateKey) {
          customPrices[dateKey] = parseFloat(String(row.price));
        }
      });
      const BASE_PRICE = parseFloat(process.env.BASE_PRICE || '150');
      return res.status(200).json({ success: true, basePrice: BASE_PRICE, customPrices });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPricesByRange(req: Request, res: Response) {
    try {
      const { start, end } = req.query;
      if (!start || !end) return res.status(400).json({ success: false, error: 'start et end requis.' });
      
      const { Op } = await import('sequelize');
      const prices = await CustomPrice.findAll({
        where: { specificDate: { [Op.between]: [start as string, end as string] } }
      });
      const customPrices: Record<string, number> = {};
      prices.forEach((row) => {
        const dateKey = row.getDataValue('specificDate');
        if (dateKey) customPrices[dateKey] = parseFloat(String(row.price));
      });
      return res.status(200).json({ success: true, basePrice: parseFloat(process.env.BASE_PRICE || '150'), customPrices });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateCustomPrice(req: Request, res: Response) {
    try {
      const { date, price } = req.body;
      if (!date || !price || isNaN(Number(price)) || Number(price) <= 0) 
        return res.status(400).json({ success: false, error: 'Données invalides.' });
      
      await CustomPrice.upsert({ specificDate: date, price: parseFloat(price) });
      return res.status(200).json({ success: true, message: `Tarif du ${date} mis à jour.` });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteCustomPrice(req: Request, res: Response) {
    try {
      const { date } = req.params;
      const deleted = await CustomPrice.destroy({ where: { specificDate: date } });
      if (deleted === 0) return res.status(404).json({ success: false, error: 'Non trouvé.' });
      return res.status(200).json({ success: true, message: 'Supprimé.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // --- NOUVELLES MÉTHODES INTÉGRÉES DANS LA CLASSE ---
  async getBasePrice(req: Request, res: Response) {
    try {
      const basePrice = parseFloat(process.env.BASE_PRICE || '150');
      return res.status(200).json({ success: true, basePrice });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateBasePrice(req: Request, res: Response) {
    try {
      const { price } = req.body;
      if (!price || isNaN(Number(price)) || Number(price) <= 0) 
        return res.status(400).json({ success: false, error: 'Prix invalide' });

      process.env.BASE_PRICE = price.toString();
      return res.status(200).json({ success: true, message: `Prix mis à jour à ${price} DT` });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
} // <--- CETTE ACCOLADE FERME BIEN LA CLASSE