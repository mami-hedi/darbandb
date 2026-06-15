import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';

const router = Router();
const controller = new NotificationController();

router.get('/',                    controller.getAll);
router.patch('/read-all',          controller.markAllRead);
router.patch('/:id/read',          controller.markOneRead);
router.delete('/:id',              controller.deleteOne);
router.delete('/',                 controller.deleteAll);

export default router;