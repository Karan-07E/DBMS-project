const User = require('../models/user');

// Get user profile
const getProfile = async (req, res) => {
  try {
    // User is already available in req.user from auth middleware
    const user = req.user;
    
    // Don't send password in response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };
    
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      lastLogin: new Date()
    });
    
    // Generate token
    const token = user.generateAuthToken();
    
    // Don't send password in response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      token
    };
    
    res.status(201).json(userData);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = user.generateAuthToken();
    
    // Don't send password in response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      token
    };
    
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, email, password } = req.body;
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    
    await user.save();
    
    // Don't send password in response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      lastLogin: user.lastLogin,
      updatedAt: user.updatedAt
    };
    
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'isAdmin', 'lastLogin', 'createdAt', 'updatedAt']
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'isAdmin', 'lastLogin', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { name, email, isAdmin } = req.body;
    
    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    
    await user.save();
    
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.destroy();
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  register,
  login,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
