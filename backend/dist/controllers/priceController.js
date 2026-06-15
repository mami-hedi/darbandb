"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceController = void 0;
const CustomPrice_1 = require("../models/CustomPrice");
const Setting_1 = require("../models/Setting");
async function fetchBasePrice() {
    const row = await Setting_1.Setting.findOne({ where: { key_name: 'base_price' } });
    return row ? parseFloat(row.value) : 1550;
}
class PriceController {
    constructor() {
        this.getAllPrices = this.getAllPrices.bind(this);
        this.updateCustomPrice = this.updateCustomPrice.bind(this);
        this.deleteCustomPrice = this.deleteCustomPrice.bind(this);
        this.getPricesByRange = this.getPricesByRange.bind(this);
        this.getBasePrice = this.getBasePrice.bind(this);
        this.updateBasePrice = this.updateBasePrice.bind(this);
    }
    async getAllPrices(req, res) {
        try {
            const prices = await CustomPrice_1.CustomPrice.findAll();
            const customPrices = {};
            prices.forEach((row) => {
                const dateKey = row.getDataValue('specificDate');
                if (dateKey) {
                    customPrices[dateKey] = parseFloat(String(row.price));
                }
            });
            const BASE_PRICE = await fetchBasePrice();
            return res.status(200).json({ success: true, basePrice: BASE_PRICE, customPrices });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    async getPricesByRange(req, res) {
        try {
            const { start, end } = req.query;
            if (!start || !end)
                return res.status(400).json({ success: false, error: 'start et end requis.' });
            const { Op } = await Promise.resolve().then(() => __importStar(require('sequelize')));
            const prices = await CustomPrice_1.CustomPrice.findAll({
                where: { specificDate: { [Op.between]: [start, end] } }
            });
            const customPrices = {};
            prices.forEach((row) => {
                const dateKey = row.getDataValue('specificDate');
                if (dateKey)
                    customPrices[dateKey] = parseFloat(String(row.price));
            });
            const BASE_PRICE = await fetchBasePrice();
            return res.status(200).json({ success: true, basePrice: BASE_PRICE, customPrices });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    async updateCustomPrice(req, res) {
        try {
            const { date, price } = req.body;
            if (!date || !price || isNaN(Number(price)) || Number(price) <= 0)
                return res.status(400).json({ success: false, error: 'Données invalides.' });
            await CustomPrice_1.CustomPrice.upsert({ specificDate: date, price: parseFloat(price) });
            return res.status(200).json({ success: true, message: `Tarif du ${date} mis à jour.` });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    async deleteCustomPrice(req, res) {
        try {
            const { date } = req.params;
            const deleted = await CustomPrice_1.CustomPrice.destroy({ where: { specificDate: date } });
            if (deleted === 0)
                return res.status(404).json({ success: false, error: 'Non trouvé.' });
            return res.status(200).json({ success: true, message: 'Supprimé.' });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    async getBasePrice(req, res) {
        try {
            const basePrice = await fetchBasePrice();
            return res.status(200).json({ success: true, basePrice });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    async updateBasePrice(req, res) {
        try {
            const { price } = req.body;
            if (!price || isNaN(Number(price)) || Number(price) <= 0)
                return res.status(400).json({ success: false, error: 'Prix invalide' });
            await Setting_1.Setting.upsert({ key_name: 'base_price', value: price.toString() });
            return res.status(200).json({ success: true, message: `Prix mis à jour à ${price} DT` });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}
exports.PriceController = PriceController;
