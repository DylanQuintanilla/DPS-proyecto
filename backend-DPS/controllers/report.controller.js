// controllers/report.controller.js
import { pool } from '../dbConfig.js';

export const generateReport = async (req, res) => {
  try {
    const { tipo_reporte, fecha_inicio, fecha_fin } = req.body;

    let query = '';
    switch (tipo_reporte) {
      case 'inventario':
        query = 'SELECT * FROM productos';
        break;
      case 'ventas':
        query = `
          SELECT m.*, p.nombre as producto_nombre 
          FROM movimientos_inventario m
          JOIN productos p ON m.producto_id = p.id
          WHERE m.tipo = 'salida'
        `;
        break;
      case 'movimientos':
        query = `
          SELECT m.*, p.nombre as producto_nombre 
          FROM movimientos_inventario m
          JOIN productos p ON m.producto_id = p.id
        `;
        break;
      case 'stock_bajo':
        query = `
          SELECT * FROM productos WHERE stock <= min_stock
        `;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Tipo de reporte no válido' });
    }

    const [data] = await pool.query(query);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, message: 'Error al generar reporte' });
  }
};