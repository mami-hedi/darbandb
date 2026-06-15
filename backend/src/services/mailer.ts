import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT ?? '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  pool:               true,   // ← réutilise la connexion
  maxConnections:     1,
  rateDelta:          2000,
  rateLimit:          3,
  socketTimeout:      30000,  // 30s
  greetingTimeout:    15000,  // 15s
  connectionTimeout:  15000,  // 15s
} as any);

transporter.verify((err) => {
  if (err) console.error('❌ Mailer non connecté :', err.message);
  else     console.log('✅ Mailer prêt —', process.env.SMTP_USER);
});

export default transporter;