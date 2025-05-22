const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, admin } = require('../middleware/auth');

// Protected routes (requires authentication)
router.post('/', auth, orderController.createOrder);
router.get('/myorders', auth, orderController.getUserOrders);
router.get('/:id', auth, orderController.getOrderById);

// Admin routes (requires admin privileges)
router.get('/', auth, admin, orderController.getAllOrders);
router.put('/:id/status', auth, admin, orderController.updateOrderStatus);

module.exports = router;
