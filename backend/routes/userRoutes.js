const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, admin } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (requires authentication)
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

// Admin routes (requires admin privileges)
router.get('/', auth, admin, userController.getAllUsers);
router.get('/:id', auth, admin, userController.getUserById);
router.put('/:id', auth, admin, userController.updateUser);
router.delete('/:id', auth, admin, userController.deleteUser);

module.exports = router;
