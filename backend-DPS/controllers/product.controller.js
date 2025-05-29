import { pool } from '../dbConfig.js';
import { v4 as uuidv4 } from 'uuid';

export const getProducts = async (req, res) => {
  try {
    console.log('getProducts llamado');
    const [rows] = await pool.query('SELECT * FROM productos');
    console.log('Productos obtenidos:', rows);
    res.json(rows);
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
      nombre, descripcion, categoria_id, precio, stock, min_stock, proveedor_id, codigo_barras, imagen_url
    } = req.body;

    const id = uuidv4();
    await pool.query(
      `INSERT INTO productos (id, nombre, descripcion, categoria_id, precio, stock, min_stock, proveedor_id, codigo_barras, imagen_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nombre, descripcion, categoria_id, precio, stock, min_stock, proveedor_id, codigo_barras, imagen_url]
    );

    res.status(201).json({ success: true, message: 'Producto creado', data: { id } });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Error al crear producto' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, descripcion, categoria_id, precio, stock, min_stock, proveedor_id, codigo_barras, imagen_url
    } = req.body;

    const [result] = await pool.query(
      `UPDATE productos SET nombre = ?, descripcion = ?, categoria_id = ?, precio = ?, 
       stock = ?, min_stock = ?, proveedor_id = ?, codigo_barras = ?, imagen_url = ?
       WHERE id = ?`,
      [nombre, descripcion, categoria_id, precio, stock, min_stock, proveedor_id, codigo_barras, imagen_url, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    res.json({ success: true, message: 'Producto actualizado' });
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
    res.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar producto' });
  }
};