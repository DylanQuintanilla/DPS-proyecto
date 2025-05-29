import express from 'express';
import {
  getAlerts,
  markAlertAsRead
} from '../controllers/alert.controller.js';

const router = express.Router();

router.get('/', getAlerts);
router.put('/:id/read', markAlertAsRead);

export default router;