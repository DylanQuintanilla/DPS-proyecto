// controllers/auth.controller.js
import { pool } from '../dbConfig.js';
// Importa bcrypt u otra librería de hashing si las contraseñas están hasheadas
// import bcrypt from 'bcrypt';

export const loginUser = async (req, res) => {
  const { nombre, contraseña } = req.body;

  if (!nombre || !contraseña) {
    return res.status(400).json({ success: false, message: 'Usuario y contraseña son obligatorios' });
  }

  try {
    // Consulta la base de datos para encontrar el usuario
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE nombre = ? OR correo = ?', [nombre, nombre]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas(correo o nombre)' });
    }

    const user = rows[0];

    // Compara la contraseña (si usas bcrypt, descomenta y adapta)
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    // }

    // Si no usas bcrypt y las contraseñas están en texto plano (NO RECOMENDADO PARA PRODUCCIÓN)
    if (contraseña !== user.contraseña) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas(contraseña'});
    }


    // Genera un token (ej. JWT)
    // Esto es un ejemplo, necesitarás una librería como `jsonwebtoken`
    // import jwt from 'jsonwebtoken';
    // const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1h' });

    // Para este ejemplo simple, devolveremos un token genérico o el ID del usuario como "token"
    const token = `user_token_${user.id}`; // Reemplaza con un token real (JWT)

    res.json({ success: true, message: 'Inicio de sesión exitoso', token, user: { id: user.id, username: user.nombre, role: user.rol } });

  } catch (error) {
    console.error('Error durante el inicio de sesión:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al iniciar sesión' });
  }
};