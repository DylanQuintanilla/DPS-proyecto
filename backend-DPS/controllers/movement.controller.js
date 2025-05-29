import { pool } from '../dbConfig.js';

export const getMovements = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, p.nombre as producto_nombre 
      FROM movimientos_inventario m
      JOIN productos p ON m.producto_id = p.id
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ success: false, message: 'Error al obtener movimientos' });
  }
};

export const getMovementById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, p.nombre as producto_nombre 
      FROM movimientos_inventario m
      JOIN productos p ON m.producto_id = p.id
      WHERE m.id = ?`, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Movimiento no encontrado' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching movement:', error);
    res.status(500).json({ success: false, message: 'Error al obtener movimiento' });
  }
};

export const createMovement = async (req, res) => {
  try {
    const { producto_id, tipo, cantidad, motivo, precio_producto } = req.body;

    if (!producto_id || !tipo || !cantidad || !motivo || !precio_producto) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const [product] = await pool.query('SELECT * FROM productos WHERE id = ?', [producto_id]);
    if (product.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const currentStock = product[0].stock;
    let newStock = tipo === 'entrada' ? currentStock + parseInt(cantidad) : currentStock - parseInt(cantidad);

    if (newStock < 0) {
      return res.status(400).json({ success: false, message: 'No hay suficiente stock para esta salida' });
    }

    const movementId = Math.floor(1000000000 + Math.random() * 9000000000); // ID numérico único
    await pool.query(
      `INSERT INTO movimientos_inventario (id, producto_id, tipo, cantidad, motivo, stock_anterior, stock_nuevo, precio_producto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [movementId, producto_id, tipo, cantidad, motivo, currentStock, newStock, precio_producto]
    );

    await pool.query('UPDATE productos SET stock = ? WHERE id = ?', [newStock, producto_id]);

    res.status(201).json({ success: true, message: 'Movimiento registrado', data: { id: movementId } });
  } catch (error) {
    console.error('Error creating movement:', error);
    res.status(500).json({ success: false, message: 'Error al registrar movimiento' });
  }
};