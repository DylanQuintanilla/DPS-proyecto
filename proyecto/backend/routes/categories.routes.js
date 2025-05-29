// routes/categories.routes.js
import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';

const router = express.Router();

// Ruta principal para categorías
router.get('/', getCategories);               
router.get('/:id', getCategoryById);
router.post('/', createCategory);            
router.put('/:id', updateCategory);            
router.delete('/:id', deleteCategory);          
export default router;