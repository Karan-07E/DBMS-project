const mongoose = require('mongoose');

// Replace with your MongoDB Atlas connection string
const uri = "mongodb+srv://vvce23cse0192:mongocs123@react.zcil8px.mongodb.net/?retryWrites=true&w=majority&appName=react";

const connectToDb = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

module.exports = { connectToDb };