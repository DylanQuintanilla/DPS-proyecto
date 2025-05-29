import { pool } from '../dbConfig.js';

export const getUsers = async (req, res) => {
  try {
    console.log('getUsers llamado');
    const [rows] = await pool.query('SELECT * FROM usuarios');
    console.log('Usuarios obtenidos:', rows);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuario' });
  }
};