import { pool } from '../dbConfig.js';
import { v4 as uuidv4 } from 'uuid';

export const getProducts = async (req, res) => {
  try {
    console.log('getProducts llamado');
    const [rows] = await pool.query('SELECT * FROM productos');
    console.log('Productos obtenidos:', rows);
    // Cambiar para ser consistente con otros endpoints
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Error al obtener producto' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      nombre, descripcion, categoria_id, precio, stock, min_stock, codigo_barras
    } = req.body;

    // Validaciones básicas
    if (!nombre || !precio || stock === undefined || min_stock === undefined || !codigo_barras) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, precio, stock, stock mínimo y código de barras son obligatorios' 
      });
    }

    const id = uuidv4();
    await pool.query(
      `INSERT INTO productos (id, nombre, descripcion, categoria_id, precio, stock, min_stock, codigo_barras)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nombre, descripcion || null, categoria_id || null, precio, stock, min_stock, codigo_barras]
    );

    const newProduct = {
      id,
      nombre,
      descripcion,
      categoria_id,
      precio,
      stock,
      min_stock,
      codigo_barras
    };

    res.status(201).json({ 
      success: true, 
      message: 'Producto creado exitosamente', 
      data: newProduct 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Error al crear producto' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, descripcion, categoria_id, precio, stock, min_stock, codigo_barras
    } = req.body;

    // Validaciones básicas
    if (!nombre || !precio || stock === undefined || min_stock === undefined || !codigo_barras) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, precio, stock, stock mínimo y código de barras son obligatorios' 
      });
    }

    const [result] = await pool.query(
      `UPDATE productos SET nombre = ?, descripcion = ?, categoria_id = ?, precio = ?, 
       stock = ?, min_stock = ?, codigo_barras = ?
       WHERE id = ?`,
      [nombre, descripcion || null, categoria_id || null, precio, stock, min_stock, codigo_barras, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    res.json({ success: true, message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar producto' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    res.json({ success: true, message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar producto' });
  }
};