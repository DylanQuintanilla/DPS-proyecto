// routes/index.js
import express from 'express';
import productsRouter from './products.routes.js';
import movementsRouter from './movements.routes.js';
import alertsRouter from './alerts.routes.js';
import usersRouter from './users.routes.js';
import reportsRouter from './reports.routes.js';
import notificationsRouter from './notifications.routes.js';
import categoriesRouter from './categories.routes.js';
import authRouter from './auth.routes.js';

const router = express.Router();

router.use('/products', productsRouter);
router.use('/movements', movementsRouter);
router.use('/alerts', alertsRouter);
router.use('/users', usersRouter);
router.use('/reports', reportsRouter);
router.use('/notifications', notificationsRouter);
router.use('/categories', categoriesRouter);
router.use('/auth', authRouter);

// Ruta raíz opcional
router.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Inventario DPS' });
});

export default router;