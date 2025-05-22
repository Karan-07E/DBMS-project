// filepath: /Users/karan/Documents/ecom/backend/models/order.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

// Order Item model
const OrderItem = sequelize.define('OrderItem', {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: ''
  }
}, {
  tableName: 'order_items',
  timestamps: false
});

// Order model
const Order = sequelize.define('Order', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'orders',
  timestamps: true
});

// Define associations
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Define association with User
Order.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });

module.exports = { Order, OrderItem };
