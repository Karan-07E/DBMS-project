const express = require('express');
const path = require('path');
const { connectToDb } = require('./db/conn');
const { Product } = require('./models/product');
const { Order } = require('./models/order');
const { User } = require('./models/user');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

// Middleware - moved before route registrations
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API Routes
// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Note: These routes are now handled by orderRoutes in routes/orders.js

// User Registration
app.post('/api/users/register', async (req, res) => {
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
app.post('/api/users/login', async (req, res) => {
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
app.get('/api/users/me', auth, async (req, res) => {
    res.json(req.user);
});

// Initialize sample products
async function initializeProducts() {
    const productsCount = await Product.countDocuments();
    
    if (productsCount === 0) {
        const sampleProducts = [
            {
                name: 'Jacob & Co. Watch',
                price: 1999999.99,
                description: 'A comfortable and stylish Ramjanmabhoomi theme based watch.',
                image: '/images/watch.avif',
                stock: 5
            },
            {
                name: 'ipad pro with M5 chip',
                price: 1499,
                description: 'unleash the power of an M5.',
                image: '/images/m5.jpg',
                stock: 50
            },
            {
                name: 'Nike Air Shoes',
                price: 399,
                description: 'Lightweight and durable running shoes.',
                image: '/images/nike.webp',
                stock: 200
            },
            {
                name: 'carbon fiber cap',
                price: 2999,
                description: 'forged carbon cap.',
                image: '/images/carbon.jpeg',
                stock: 10
            },
            {
                name: 'Toy Plane',
                price: 199,
                description: 'toy plane for kids.',
                image: '/images/plane.jpeg',
                stock: 500
            },
            {
                name: 'Apple Watch',
                price: 1999,
                description: 'Track your fitness and stay connected.',
                image: '/images/apple.webp',
                stock: 100
            },
            {
                name: 'Apple Macbook Air M2',
                price: 1299,
                description: `with inbuilt Apple' s M2 chip.`,
                image: '/images/mac.avif',
                stock: 200
            },
            {
                name: 'GTA V',
                price: 499,
                description: 'Best game ever.',
                image: '/images/gta.jpg',
                stock: 50
            },
        ];
        
        await Product.insertMany(sampleProducts);
        console.log('Sample products initialized');
    }
}

// Start server
async function startServer() {
    try {
        await connectToDb();
        console.log('Connected to MongoDB Atlas');
        
        await initializeProducts();
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Current Date and Time (UTC): ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

startServer();