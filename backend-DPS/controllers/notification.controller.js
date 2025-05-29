// controllers/notification.controller.js
import { pool } from '../dbConfig.js';

export const getNotificationsByUserId = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notificaciones WHERE usuario_id = ?', [req.params.userId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error al obtener notificaciones' });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE notificaciones SET leido = TRUE WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    }
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar notificación' });
  }
};