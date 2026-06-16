import nodemailer from 'nodemailer';
import { Resend } from 'resend';

interface MailOptions {
  from:     string;
  to:       string;
  replyTo?: string;
  subject:  string;
  html:     string;
  text:     string;
}

// ── Resend (production / Render) ──────────────────────────────────
const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ── Nodemailer (local / dev) ──────────────────────────────────────
const nodemailerTransport = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT ?? '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
  socketTimeout:     30000,
  greetingTimeout:   15000,
  connectionTimeout: 15000,
} as any);

// ── Fonction unifiée ──────────────────────────────────────────────
export async function sendMail(options: MailOptions): Promise<void> {
  if (resendClient) {
    // Production : Resend via HTTPS
    const { error } = await resendClient.emails.send({
      from:     options.from,
      to:       options.to,
      replyTo:  options.replyTo,
      subject:  options.subject,
      html:     options.html,
      text:     options.text,
    });
    if (error) throw new Error(`Resend error: ${error.message}`);
  } else {
    // Local : Nodemailer + Gmail SMTP
    await nodemailerTransport.sendMail(options);
  }
}

// Vérification au démarrage (local seulement)
if (!resendClient) {
  nodemailerTransport.verify((err) => {
    if (err) console.error('❌ Mailer non connecté :', err.message);
    else     console.log('✅ Mailer prêt (Nodemailer) —', process.env.SMTP_USER);
  });
} else {
  console.log('✅ Mailer prêt (Resend)');
}