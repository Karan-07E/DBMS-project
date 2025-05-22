const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, admin } = require('../middleware/auth');

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin routes (requires admin privileges)
router.post('/', auth, admin, productController.createProduct);
router.put('/:id', auth, admin, productController.updateProduct);
router.delete('/:id', auth, admin, productController.deleteProduct);
router.patch('/:id/stock', auth, admin, productController.updateProductStock);

module.exports = router;
