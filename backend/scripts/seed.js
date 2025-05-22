// Database seed script for e-commerce app
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const User = require('../models/user');
const Product = require('../models/product');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    isAdmin: true
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123'
  }
];

const products = [
  {
    name: 'Apple iPhone 14',
    description: 'Latest iPhone model with improved camera, performance, and battery life.',
    price: 999.99,
    image: '/images/apple.webp',
    stock: 15
  },
  {
    name: 'Carbon Fiber Wallet',
    description: 'Slim RFID-blocking carbon fiber wallet with minimalist design.',
    price: 49.99,
    image: '/images/carbon.jpeg',
    stock: 30
  },
  {
    name: 'Gaming Console - GTA Bundle',
    description: 'Next-gen gaming console with GTA game bundle and extra controller.',
    price: 599.99,
    image: '/images/gta.jpg',
    stock: 10
  },
  {
    name: 'BMW M5 Model Car',
    description: 'Detailed 1:18 scale model of the BMW M5 competition sports sedan.',
    price: 129.99,
    image: '/images/m5.jpg',
    stock: 20
  },
  {
    name: 'MacBook Pro M2',
    description: 'Apple MacBook Pro with M2 chip, 16GB RAM and 512GB SSD.',
    price: 1499.99,
    image: '/images/mac.avif',
    stock: 12
  },
  {
    name: 'Nike Air Jordan',
    description: 'Classic Nike Air Jordan sneakers with modern comfort features.',
    price: 179.99,
    image: '/images/nike.webp',
    stock: 25
  },
  {
    name: 'Travel Package - Europe',
    description: 'All-inclusive European vacation package with flights and accommodations.',
    price: 2999.99,
    image: '/images/plane.jpeg',
    stock: 5
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced smartwatch with health tracking, GPS, and waterproof design.',
    price: 249.99,
    image: '/images/watch.avif',
    stock: 18
  }
];

// Seed database function
const seedDatabase = async () => {
  try {
    // Drop tables in correct order to avoid foreign key constraint issues
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('DROP TABLE IF EXISTS order_items');
    await sequelize.query('DROP TABLE IF EXISTS orders');
    await sequelize.query('DROP TABLE IF EXISTS products');
    await sequelize.query('DROP TABLE IF EXISTS users');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced');
    
    // Create users
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        return User.create({
          name: user.name,
          email: user.email,
          password: hashedPassword,
          isAdmin: user.isAdmin || false,
          lastLogin: new Date()
        });
      })
    );
    
    console.log(`${createdUsers.length} users created`);
    
    // Create products
    const createdProducts = await Promise.all(
      products.map(product => Product.create(product))
    );
    
    console.log(`${createdProducts.length} products created`);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
