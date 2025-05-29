// controllers/category.controller.js
import { pool } from '../dbConfig.js';

/**
 * Obtener todas las categorías
 */
export const getCategories = async (req, res) => {
  try {
    console.log('getCategories llamado');
    const [rows] = await pool.query('SELECT id, nombre, descripcion, creado_en FROM categorias ORDER BY nombre ASC');
    console.log('Categorías obtenidas:', rows);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Error al obtener categorías' });
  }
};

/**
 * Obtener una categoría por ID
 */
export const getCategoryById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Error al obtener categoría' });
  }
};

/**
 * Crear una nueva categoría
 */
export const createCategory = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    // Verificar si ya existe una categoría con ese nombre
    const [existing] = await pool.query('SELECT id FROM categorias WHERE nombre = ?', [nombre]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
    }

    const [result] = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion || null]
    );

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { id: result.insertId, nombre, descripcion }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Error al crear categoría' });
  }
};

/**
 * Actualizar una categoría por ID
 */
export const updateCategory = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    const [category] = await pool.query('SELECT id FROM categorias WHERE id = ?', [req.params.id]);
    if (category.length === 0) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    // Verificar si el nombre ya está usado por otra categoría
    const [existing] = await pool.query('SELECT id FROM categorias WHERE nombre = ? AND id != ?', [nombre, req.params.id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
    }

    await pool.query('UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion || null, req.params.id]);

    res.json({ success: true, message: 'Categoría actualizada exitosamente' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar categoría' });
  }
};

/**
 * Eliminar una categoría por ID
 */
export const deleteCategory = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM categorias WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    // Opcional: verificar que la categoría no tenga productos asociados
    const [products] = await pool.query('SELECT id FROM productos WHERE categoria_id = ?', [req.params.id]);
    if (products.length > 0) {
      return res.status(400).json({ success: false, message: 'No se puede eliminar la categoría porque tiene productos asociados' });
    }

    await pool.query('DELETE FROM categorias WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar categoría' });
  }
};