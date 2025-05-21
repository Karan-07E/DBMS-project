const mongoose = require('mongoose');
const { Product } = require('../models/product');
const { connectToDb } = require('../db/conn');

const frontendProducts = [
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
        stock: 20
    },
    {
        name: 'Nike Air Shoes',
        price: 399,
        description: 'Lightweight and durable running shoes.',
        image: '/images/nike.webp',
        stock: 30
    },
    {
        name: 'carbon fiber cap',
        price: 2999,
        description: 'forged carbon cap.',
        image: '/images/carbon.jpeg',
        stock: 15
    },
    {
        name: 'Toy Plane',
        price: 199,
        description: 'toy plane for kids.',
        image: '/images/plane.jpeg',
        stock: 50
    },
    {
        name: 'Apple Watch',
        price: 1999,
        description: 'Track your fitness and stay connected.',
        image: '/images/apple.webp',
        stock: 25
    },
    {
        name: 'Apple Macbook Air M2',
        price: 1299,
        description: "with inbuilt Apple's M2 chip.",
        image: '/images/mac.avif',
        stock: 10
    },
    {
        name: 'GTA V',
        price: 499,
        description: 'Best game ever.',
        image: '/images/gta.jpg',
        stock: 100
    }
];

async function resetAndPopulateProducts() {
    try {
        console.log('Connecting to database...');
        await connectToDb();
        console.log('Connected to MongoDB Atlas');
        
        // Delete all existing products
        console.log('Deleting all existing products...');
        await Product.deleteMany({});
        console.log('All products deleted.');
        
        // Insert new products
        console.log('Inserting frontend products...');
        await Product.insertMany(frontendProducts);
        console.log(`${frontendProducts.length} products inserted successfully!`);
        
        // Display inserted products
        const insertedProducts = await Product.find();
        console.log('Inserted product IDs:');
        insertedProducts.forEach(product => {
            console.log(`- ${product.name}: ${product._id}`);
        });
        
        console.log('Database reset and population completed.');
        
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('Database connection closed.');
        
        process.exit(0);
    } catch (error) {
        console.error('Error resetting and populating products:', error);
        process.exit(1);
    }
}

// Run the function
resetAndPopulateProducts();