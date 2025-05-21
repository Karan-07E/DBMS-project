const express = require('express');
const { Order } = require('../models/order');
const auth = require('../middleware/auth');
const router = express.Router();
const { timeLogger } = require('../middleware/time-logger');

// Create a new order
router.post('/', auth, timeLogger, async (req, res) => {
    try {
        // Add user ID to order
        const order = new Order({
            ...req.body,
            user: req.user._id
        });
        
        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user's orders
router.get('/my-orders', auth, timeLogger, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific order by ID
router.get('/:id', auth, timeLogger, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order status (admin only, would include admin middleware in a full implementation)
router.patch('/:id/status', auth, timeLogger, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'processing', 'shipped', 'delivered'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        order.status = status;
        const updatedOrder = await order.save();
        
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;