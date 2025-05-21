const express = require('express');
const { User } = require('../models/user');
const auth = require('../middleware/auth');
const { timeLogger } = require('../middleware/time-logger');
const router = express.Router();

// User Registration
router.post('/register', timeLogger, async (req, res) => {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        
        const user = new User(req.body);
        await user.save();
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// User Login
router.post('/login', timeLogger, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid login credentials' });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid login credentials' });
        }
        
        // Update last login time
        user.lastLogin = new Date();
        await user.save();
        
        // Generate auth token
        const token = user.generateAuthToken();
        
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current user profile
router.get('/me', auth, timeLogger, async (req, res) => {
    res.json(req.user);
});

// Update user profile
router.patch('/me', auth, timeLogger, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
    }
    
    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        
        res.json(req.user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;