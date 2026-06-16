import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { sendMail } from '../services/mailer';
import { Contact } from '../models/Contact';

const router = Router();

const SUBJECT_LABELS: Record<string, string> = {
  general:     'Demande générale',
  service:     'Service & Prestations',
  partnership: 'Partenariat',
  support:     'Assistance',
  other:       'Autre',
};

// ── Validation ────────────────────────────────────────────────────
const validate = [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis.'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis.'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide.'),
  body('phone').optional({ checkFalsy: true }).isMobilePhone('any'),
  body('subject').isIn(Object.keys(SUBJECT_LABELS)).withMessage('Sujet invalide.'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message trop court (min. 10 caractères).'),
];

// ── POST /api/contacts ────────────────────────────────────────────
router.post('/', validate, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg });
  }

  const { firstName, lastName, email, phone, subject, message } = req.body;
  const subjectLabel = SUBJECT_LABELS[subject];

  const date = new Date().toLocaleString('fr-TN', {
    timeZone: 'Africa/Tunis',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  try {
    // ── 1. Sauvegarde MySQL ──────────────────────────────────────
    await Contact.create({ firstName, lastName, email, phone: phone || null, subject, message });

    // ── 2. Email interne (notification équipe) ───────────────────
    await sendMail({
      from:    process.env.CONTACT_FROM,
      to:      process.env.CONTACT_RECIPIENT,
      replyTo: email,
      subject: `[Dar B&B] ${subjectLabel} — ${firstName} ${lastName}`,
      html: buildInternalEmail({ firstName, lastName, email, phone, subjectLabel, message, date }),
      text: `Nouveau message de ${firstName} ${lastName} (${email})\nSujet : ${subjectLabel}\n\n${message}`,
    });

    // ── 3. Accusé de réception (visiteur) ────────────────────────
    await sendMail({
      from:    process.env.CONTACT_FROM,
      to:      email,
      subject: 'Votre message a bien été reçu — Dar B&B',
      html:    buildAckEmail(firstName, subjectLabel),
      text:    `Bonjour ${firstName},\n\nVotre message a bien été reçu. Nous vous répondrons rapidement.\n\nL'équipe Dar B&B`,
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Contact route error:', err);
    return res.status(500).json({ error: "L'envoi du message a échoué. Réessayez dans quelques instants." });
  }
});

// GET /api/contacts — liste tous les messages
router.get('/', async (_req, res) => {
  try {
    const contacts = await Contact.findAll({
      order: [['createdAt', 'DESC']],
    });
    return res.json({ data: contacts });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/contacts/:id — supprime un message
router.delete('/:id', async (req, res) => {
  try {
    await Contact.destroy({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur suppression.' });
  }
});

export default router;

// ── Templates HTML inline ─────────────────────────────────────────

function buildInternalEmail(data: {
  firstName: string; lastName: string; email: string;
  phone?: string;    subjectLabel: string; message: string; date: string;
}): string {
  return `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<style>
  body{font-family:Georgia,serif;background:#0a0a0a;color:#e5e5e5;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#111;border:1px solid #2a2a2a}
  .hdr{background:#000;padding:28px 36px;border-bottom:1px solid #222}
  .hdr p{margin:0;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#666}
  .hdr h1{margin:8px 0 0;font-size:20px;font-weight:400;letter-spacing:.1em;color:#fff}
  .body{padding:28px 36px}
  .badge{display:inline-block;padding:2px 10px;background:#1a1a1a;border:1px solid #333;
         font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#888;margin-bottom:24px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
  .field-label{font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:#666;margin-bottom:4px}
  .field-value{font-size:13px;color:#e5e5e5;padding:10px 14px;background:#1a1a1a;border-left:2px solid #333}
  .msg{background:#1a1a1a;border:1px solid #2a2a2a;padding:18px;font-size:13px;
       line-height:1.8;color:#ccc;white-space:pre-wrap;margin-top:6px}
  .foot{padding:16px 36px;border-top:1px solid #1a1a1a;font-size:11px;color:#444;text-align:center}
</style></head><body>
<div class="wrap">
  <div class="hdr">
    <p>Dar B&amp;B — Nouveau message</p>
    <h1>${data.subjectLabel}</h1>
  </div>
  <div class="body">
    <div class="badge">Reçu le ${data.date}</div>
    <div class="grid">
      <div><div class="field-label">Prénom</div><div class="field-value">${data.firstName}</div></div>
      <div><div class="field-label">Nom</div><div class="field-value">${data.lastName}</div></div>
    </div>
    <div style="margin-bottom:14px">
      <div class="field-label">Email</div>
      <div class="field-value">${data.email}</div>
    </div>
    ${data.phone ? `
    <div style="margin-bottom:14px">
      <div class="field-label">Téléphone</div>
      <div class="field-value">${data.phone}</div>
    </div>` : ''}
    <div style="margin-top:20px">
      <div class="field-label">Message</div>
      <div class="msg">${data.message}</div>
    </div>
  </div>
  <div class="foot">Dar B&amp;B · Hammamet, Tunisie · experience@bnb-villa.com</div>
</div>
</body></html>`;
}

function buildAckEmail(firstName: string, subjectLabel: string): string {
  return `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<style>
  body{font-family:Georgia,serif;background:#fafafa;color:#333;margin:0;padding:0}
  .wrap{max-width:560px;margin:40px auto;background:#fff;border:1px solid #eee;padding:40px}
  .label{font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#999}
  h2{font-weight:400;font-size:22px;margin:12px 0 20px}
  p{line-height:1.8;color:#555;font-size:14px}
  .foot{margin-top:32px;padding-top:20px;border-top:1px solid #eee;
        font-size:11px;color:#aaa}
</style></head><body>
<div class="wrap">
  <p class="label">Dar B&amp;B · Hammamet</p>
  <h2>Bonjour ${firstName},</h2>
  <p>
    Nous avons bien reçu votre message concernant <strong>${subjectLabel}</strong>.
    Notre équipe vous répondra dans les plus brefs délais.
  </p>
  <p>À très bientôt,<br/>L'équipe Dar B&amp;B</p>
  <div class="foot">
    Hammamet, Tunisie · +216 99 310 733 · experience@bnb-villa.com
  </div>
</div>
</body></html>`;
}