// controllers/dashboard.controller.js
import { pool } from '../dbConfig.js';

/**
 * Obtener datos del dashboard
 */
export const getDashboardData = async (req, res) => {
  try {
    // Total de productos
    const [products] = await pool.query('SELECT COUNT(*) AS total FROM productos');

    // Productos con stock bajo (stock <= min_stock)
    const [lowStock] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM productos 
      WHERE stock <= min_stock
    `);

    // Productos sin stock
    const [outOfStock] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM productos 
      WHERE stock = 0
    `);

    // Valor total del inventario (precio * stock)
    const [totalValueResult] = await pool.query(`
      SELECT SUM(precio * stock) AS total_value 
      FROM productos
    `);

    const dashboardData = {
      totalProducts: products[0].total,
      lowStockCount: lowStock[0].count,
      outOfStockCount: outOfStock[0].count,
      totalValue: parseFloat(totalValueResult[0].total_value || 0),
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: 'Error al obtener datos del dashboard' });
  }
};