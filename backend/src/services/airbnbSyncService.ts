// services/airbnbSyncService.ts
import * as ical from 'node-ical';
import { AirbnbBlock } from '../models/AirbnbBlock';

const ICAL_URL = process.env.AIRBNB_ICAL_URL as string;

function toDateOnly(d: Date): string {
  // Utilise les getters LOCAUX (pas toISOString) pour matcher
  // la construction locale-midnight de node-ical sur les dates all-day
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export class AirbnbSyncService {
  async sync(): Promise<{ synced: number; removed: number }> {
    if (!ICAL_URL) {
      throw new Error('AIRBNB_ICAL_URL non configuré dans .env');
    }

    const data = await ical.async.fromURL(ICAL_URL);
    const events = Object.values(data).filter(
      (e: any) => e.type === 'VEVENT'
    ) as ical.VEvent[];

    const incomingUids: string[] = [];

    for (const event of events) {
      const uid = event.uid;
      const startDate = toDateOnly(event.start as Date);
      const endDate = toDateOnly(event.end as Date);
      const summary = event.summary || 'Airbnb (Réservé)';

      incomingUids.push(uid);

      const [block, created] = await AirbnbBlock.findOrCreate({
        where: { uid },
        defaults: { uid, startDate, endDate, summary },
      });

      if (!created) {
  await block.update({ startDate, endDate, summary }); // ← updatedAt mis à jour automatiquement
}
    }

    // Supprime les blocages Airbnb qui ne sont plus dans le flux (annulations)
    let removed = 0;
    if (incomingUids.length > 0) {
      const { Op } = await import('sequelize');
      removed = await AirbnbBlock.destroy({
        where: { uid: { [Op.notIn]: incomingUids } },
      });
    }

    return { synced: incomingUids.length, removed };
  }
}