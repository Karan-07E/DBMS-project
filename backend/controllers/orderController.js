const { Order, OrderItem } = require('../models/order');
const Product = require('../models/product');
const { sequelize } = require('../config/database');

// Create new order
const createOrder = async (req, res) => {
  // Start a transaction to ensure atomic operations
  const t = await sequelize.transaction();
  
  try {
    const { items, shippingAddress } = req.body;
    
    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'No order items' });
    }
    
    // Calculate total price and check product availability
    let totalPrice = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      
      // Check if product exists
      if (!product) {
        await t.rollback();
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }
      
      // Check if enough stock
      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }
      
      // Update running total
      totalPrice += product.price * item.quantity;
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save({ transaction: t });
    }
    
    // Create order
    const order = await Order.create({
      userId: req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerAddress: shippingAddress,
      totalPrice,
      status: 'pending'
    }, { transaction: t });
    
    // Create order items
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      
      const orderItem = await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      }, { transaction: t });
      
      orderItems.push(orderItem);
    }
    
    // Commit transaction
    await t.commit();
    
    res.status(201).json({
      order: {
        id: order.id,
        userId: order.userId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt
      },
      items: orderItems
    });
  } catch (error) {
    // Rollback transaction on error
    await t.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    console.log(`Fetching orders for user ${req.user.id}`);
    
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${orders.length} orders for user ${req.user.id}`);
    
    // Convert to plain objects to avoid sequelize-specific properties
    const plainOrders = orders.map(order => order.get({ plain: true }));
    
    res.status(200).json(plainOrders);
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log(`Fetching order with ID: ${orderId} for user ${req.user.id}`);
    
    const order = await Order.findOne({
      where: { 
        id: orderId,
        userId: req.user.id  // Ensure user can only access their own orders
      },
      include: [{ model: OrderItem, as: 'items' }]
    });
    
    if (!order) {
      console.log(`Order with ID: ${orderId} not found for user ${req.user.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Log successful order fetch
    console.log(`Successfully fetched order ${orderId} with ${order.items ? order.items.length : 0} items`);
    
    // Convert to plain object to avoid sequelize-specific properties
    const plainOrder = order.get({ plain: true });
    
    // Return the order with all its items
    res.status(200).json(plainOrder);
  } catch (error) {
    console.error('Error getting order by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows: orders } = await Order.findAndCountAll({
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      orders,
      page,
      pages: totalPages,
      totalOrders: count
    });
  } catch (error) {
    console.error('Error getting all orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    order.status = status;
    await order.save();
    
    res.status(200).json({
      id: order.id,
      status: order.status,
      updatedAt: order.updatedAt
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
