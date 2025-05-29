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

export const createUser = async (req, res) => {
  try {
    const { nombre, correo, rol, contraseña } = req.body;

    if (!nombre || !correo || !rol || !contraseña) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son obligatorios' 
      });
    }

    // Verificar si ya existe un usuario con ese correo
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un usuario con ese correo' 
      });
    }

    // Validar rol
    const validRoles = ['admin', 'visualizador', 'inventario'];
    if (!validRoles.includes(rol)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rol no válido. Debe ser: admin, visualizador o inventario' 
      });
    }

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, rol, contraseña) VALUES (?, ?, ?, ?)',
      [nombre, correo, rol, contraseña]
    );

    const newUser = {
      id: result.insertId,
      nombre,
      correo,
      rol,
      creado_en: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Error al crear usuario' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { nombre, correo, rol, contraseña } = req.body;

    if (!nombre || !correo || !rol) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, correo y rol son obligatorios' 
      });
    }

    // Verificar que el usuario existe
    const [user] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [req.params.id]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Verificar si el correo ya está usado por otro usuario
    const [existing] = await pool.query(
      'SELECT id FROM usuarios WHERE correo = ? AND id != ?', 
      [correo, req.params.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un usuario con ese correo' 
      });
    }

    // Validar rol
    const validRoles = ['admin', 'visualizador', 'inventario'];
    if (!validRoles.includes(rol)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rol no válido. Debe ser: admin, visualizador o inventario' 
      });
    }

    // Si se proporciona contraseña, actualizarla también
    let query, params;
    if (contraseña && contraseña.trim() !== '') {
      query = 'UPDATE usuarios SET nombre = ?, correo = ?, rol = ?, contraseña = ? WHERE id = ?';
      params = [nombre, correo, rol, contraseña, req.params.id];
    } else {
      query = 'UPDATE usuarios SET nombre = ?, correo = ?, rol = ? WHERE id = ?';
      params = [nombre, correo, rol, req.params.id];
    }

    await pool.query(query, params);

    res.json({ success: true, message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    await pool.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
  }
};