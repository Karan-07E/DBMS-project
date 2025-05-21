// Script to update existing orders with proper image URLs
const mongoose = require('mongoose');
const { Order } = require('../models/order');
const { Product } = require('../models/product');

// Get the MongoDB Atlas connection string from conn.js
const uri = "mongodb+srv://vvce23cse0192:mongocs123@react.zcil8px.mongodb.net/?retryWrites=true&w=majority&appName=react";

// Connect to MongoDB
console.log('Connecting to MongoDB Atlas...');
mongoose.connect(uri, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Atlas connected successfully');
    updateOrderImages();
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

async function updateOrderImages() {
    try {
        console.log('Starting to update order images...');
        
        // Get all products for reference
        console.log('Fetching products...');
        const products = await Product.find();
        console.log(`Found ${products.length} products`);
        
        if (products.length === 0) {
            console.log('No products found. Please make sure your database has products.');
            return;
        }
        
        const productMap = {};
        
        // Create a map of product IDs to images
        products.forEach(product => {
            productMap[product._id.toString()] = product.image;
            console.log(`Product: ${product.name}, ID: ${product._id}, Image: ${product.image}`);
        });
        
        // Get all orders
        console.log('Fetching orders...');
        const orders = await Order.find();
        console.log(`Found ${orders.length} orders to update`);
        
        if (orders.length === 0) {
            console.log('No orders found. Create some orders first.');
            return;
        }
        
        let updatedCount = 0;
        
        // Update each order's items with images from their respective products
        for (const order of orders) {
            console.log(`Processing order: ${order._id}`);
            let orderUpdated = false;
            
            for (const item of order.items) {
                console.log(`Order item: ${item.name}, ProductID: ${item.productId}, Current image: ${item.image || 'none'}`);
                
                // Check if this product exists in our product map
                if (productMap[item.productId]) {
                    console.log(`Found matching product with image: ${productMap[item.productId]}`);
                    item.image = productMap[item.productId];
                    orderUpdated = true;
                } else {
                    // Try to find a product with a similar name
                    const similarProduct = products.find(p => p.name.toLowerCase() === item.name.toLowerCase());
                    if (similarProduct) {
                        console.log(`Found similar product by name: ${similarProduct.name} with image: ${similarProduct.image}`);
                        item.image = similarProduct.image;
                        orderUpdated = true;
                    } else {
                        console.log(`No matching product found for ${item.productId} (${item.name})`);
                        // Set default image
                        item.image = 'images/placeholder.jpg';
                        orderUpdated = true;
                    }
                }
            }
            
            if (orderUpdated) {
                await order.save();
                updatedCount++;
                console.log(`Updated order: ${order._id}`);
            } else {
                console.log(`No updates needed for order: ${order._id}`);
            }
        }
        
        console.log(`Successfully updated ${updatedCount} orders`);
    } catch (error) {
        console.error('Error updating orders:', error);
    } finally {
        // Close the MongoDB connection after 2 seconds
        setTimeout(() => {
            mongoose.connection.close();
            console.log('MongoDB connection closed');
            process.exit();
        }, 2000);
    }
}

// The function will be called after MongoDB connects successfully
