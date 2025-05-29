import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import productsRouter from './routes/products.routes.js';
import movementsRouter from './routes/movements.routes.js';
import alertsRouter from './routes/alerts.routes.js';
import usersRouter from './routes/users.routes.js';
import reportsRouter from './routes/reports.routes.js';
import notificationsRouter from './routes/notifications.routes.js';
import categoriesRouter from './routes/categories.routes.js';
import authRouter from './routes/auth.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import { pool } from './dbConfig.js';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Usar rutas
app.use('/products', productsRouter);
app.use('/movements', movementsRouter);
app.use('/alerts', alertsRouter);
app.use('/users', usersRouter);
app.use('/reports', reportsRouter);
app.use('/notifications', notificationsRouter);
app.use('/notifications', notificationsRouter);
app.use('/categories', categoriesRouter);
app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter);
app.use('/api', routes); // Puedes dejar esto para rutas agrupadas o raíz

// Probar conexión a la base de datos al iniciar
pool.getConnection()
  .then(conn => {
    console.log('🟢 Conectado a la base de datos MySQL');
    conn.release();
  })
  .catch(err => {
    console.error('🔴 Error al conectar con la base de datos:', err.message);
  });

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
});