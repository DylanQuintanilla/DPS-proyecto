import express from 'express';
import {
  getMovements,
  getMovementById,
  createMovement
} from '../controllers/movement.controller.js';

const router = express.Router();

router.get('/', getMovements);
router.get('/:id', getMovementById);
router.post('/', createMovement);

export default router;