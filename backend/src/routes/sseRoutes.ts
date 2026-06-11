import { Router, Request, Response } from 'express';
import { notifier } from '../services/sseService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data: object) =>
    res.write(`data: ${JSON.stringify(data)}\n\n`);

  notifier.on('new-reservation', send);

  // Heartbeat toutes les 30s (évite timeout Render/proxy)
  const hb = setInterval(() => res.write(': heartbeat\n\n'), 30_000);

  req.on('close', () => {
    notifier.off('new-reservation', send);
    clearInterval(hb);
  });
});

export default router;