// routes/notifications.routes.js
import express from 'express';
import {
  getNotificationsByUserId,
  markNotificationAsRead
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/:userId', getNotificationsByUserId);
router.put('/:id/read', markNotificationAsRead);

export default router;