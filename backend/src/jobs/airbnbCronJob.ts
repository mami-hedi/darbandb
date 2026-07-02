// jobs/airbnbCronJob.ts
import cron from 'node-cron';
import { AirbnbSyncService } from '../services/airbnbSyncService';

const syncService = new AirbnbSyncService();

export function startAirbnbCron() {
  // Toutes les 2h
  cron.schedule('0 */2 * * *', async () => {
    try {
      const result = await syncService.sync();
      console.log(`[Airbnb Sync] ${result.synced} événements, ${result.removed} supprimés`);
    } catch (err: any) {
      console.error('[Airbnb Sync] Erreur:', err.message);
    }
  });

  // Sync immédiate au démarrage
  syncService.sync()
    .then(r => console.log(`[Airbnb Sync] Initial: ${r.synced} événements`))
    .catch(err => console.error('[Airbnb Sync] Erreur initiale:', err.message));
}