// filepath: /Users/karan/Documents/ecom/backend/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectToDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL database');
    
    // Sync all models with the database without altering existing tables
    // This will only create tables that don't exist
    await sequelize.sync();
    console.log('Database synchronized');
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  connectToDb
};
