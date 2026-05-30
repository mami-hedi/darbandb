"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateRuleController = void 0;
const RateRule_1 = require("../models/RateRule");
// Helper : convertit un enregistrement DB → objet frontend
const toFrontend = (rule) => ({
    id: String(rule.id),
    name: rule.name,
    basePrice: parseFloat(String(rule.basePrice)),
    startDate: rule.startDate ?? undefined,
    endDate: rule.endDate ?? undefined,
    daysOfWeek: JSON.parse(rule.daysOfWeek || '[]'), // string → tableau
    isActive: Boolean(rule.isActive),
});
class RateRuleController {
    constructor() {
        this.getAll = this.getAll.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }
    // GET /api/rates
    async getAll(req, res) {
        try {
            const rules = await RateRule_1.RateRule.findAll({ order: [['id', 'ASC']] });
            return res.json({ success: true, data: rules.map(toFrontend) });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    // POST /api/rates
    async create(req, res) {
        console.log("🔍 req.body:", JSON.stringify(req.body, null, 2));
        console.log("🔍 Content-Type:", req.headers['content-type']);
        try {
            const { name, basePrice, startDate, endDate, daysOfWeek, isActive } = req.body;
            // Validation
            if (!name || typeof name !== 'string' || name.trim() === '') {
                return res.status(400).json({ success: false, error: 'Le champ "name" est requis.' });
            }
            if (!basePrice || isNaN(Number(basePrice)) || Number(basePrice) <= 0) {
                return res.status(400).json({ success: false, error: 'Le champ "basePrice" doit être > 0.' });
            }
            if (!daysOfWeek) {
                return res.status(400).json({ success: false, error: 'Le champ "daysOfWeek" est requis.' });
            }
            const rule = await RateRule_1.RateRule.create({
                name: name.trim(),
                basePrice: Number(basePrice),
                startDate: startDate || null,
                endDate: endDate || null,
                daysOfWeek: JSON.stringify(daysOfWeek), // tableau → string
                isActive: isActive !== undefined ? Boolean(isActive) : true,
            });
            return res.status(201).json({ success: true, data: toFrontend(rule) });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    // PUT /api/rates/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const rule = await RateRule_1.RateRule.findByPk(id);
            if (!rule) {
                return res.status(404).json({ success: false, error: 'Règle introuvable.' });
            }
            const { name, basePrice, startDate, endDate, daysOfWeek, isActive } = req.body;
            await rule.update({
                name: name !== undefined ? name.trim() : rule.name,
                basePrice: basePrice !== undefined ? Number(basePrice) : rule.basePrice,
                startDate: startDate !== undefined ? (startDate || null) : rule.startDate,
                endDate: endDate !== undefined ? (endDate || null) : rule.endDate,
                daysOfWeek: daysOfWeek !== undefined ? JSON.stringify(daysOfWeek) : rule.daysOfWeek,
                isActive: isActive !== undefined ? Boolean(isActive) : rule.isActive,
            });
            return res.json({ success: true, data: toFrontend(rule) });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    // DELETE /api/rates/:id
    async delete(req, res) {
        try {
            const { id } = req.params;
            const rule = await RateRule_1.RateRule.findByPk(id);
            if (!rule) {
                return res.status(404).json({ success: false, error: 'Règle introuvable.' });
            }
            await rule.destroy();
            return res.json({ success: true, message: 'Règle supprimée.' });
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}
exports.RateRuleController = RateRuleController;
