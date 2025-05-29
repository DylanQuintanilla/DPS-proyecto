// controllers/alert.controller.js
import { pool } from '../dbConfig.js';

export const getAlerts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, p.nombre AS producto_nombre 
      FROM alertas_stock a
      JOIN productos p ON a.producto_id = p.id
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, message: 'Error al obtener alertas' });
  }
};

export const markAlertAsRead = async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE alertas_stock SET leido = TRUE WHERE id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Alerta no encontrada' });
    }
    res.json({ success: true, message: 'Alerta marcada como leída' });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar alerta' });
  }
};