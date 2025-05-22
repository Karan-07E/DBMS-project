const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and adds user to request object
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed. No token provided.' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findByPk(decoded.id);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }
    
    // Add user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Authentication failed. Invalid token.' });
  }
};

/**
 * Admin middleware to protect admin routes
 * Should be used after auth middleware
 */
const admin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = { auth, admin };