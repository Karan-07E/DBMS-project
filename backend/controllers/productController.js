const Product = require('../models/product');
const { Op } = require('sequelize');

// Get all products with pagination and filtering
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query conditions
    const condition = search 
      ? { name: { [Op.like]: `%${search}%` } } 
      : null;
    
    // Find products with pagination and count
    const { count, rows: products } = await Product.findAndCountAll({
      where: condition,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      products,
      page,
      pages: totalPages,
      totalProducts: count
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Error getting product by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Create a product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, stock } = req.body;
    
    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      image: image || '',
      stock: stock || 0
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Update a product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const { name, description, price, image, stock } = req.body;
    
    // Update fields if provided
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (image !== undefined) product.image = image;
    if (stock !== undefined) product.stock = stock;
    
    await product.save();
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.destroy();
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update product stock
const updateProductStock = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const { stock } = req.body;
    
    if (stock === undefined) {
      return res.status(400).json({ message: 'Stock quantity is required' });
    }
    
    product.stock = stock;
    await product.save();
    
    res.status(200).json({
      id: product.id,
      name: product.name,
      stock: product.stock
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock
};
