// Server entry point for e-commerce API
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import database connection
const { connectToDb } = require('./config/database');

// Import middleware
const timeLogger = require('./middleware/timeLogger');

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(timeLogger);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Serve static assets
// Set static folder for frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Any route that is not an API route will be redirected to index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// Set port
const PORT = process.env.PORT || 3000;

// Connect to database and start server
const startServer = async () => {
  try {
    const connected = await connectToDb();
    
    if (connected) {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } else {
      console.error('Failed to start server due to database connection issues');
    }
  } catch (error) {
    console.error('Server startup error:', error);
  }
};

startServer();

module.exports = app; // For testing purposes