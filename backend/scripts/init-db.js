// Create database script for MySQL
const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'ecom';

const initialize = async () => {
  try {
    // Create connection without database name
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });
    
    console.log('Connected to MySQL server');
    
    // Check if database exists
    const [rows] = await connection.execute(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${DB_NAME}'`
    );
    
    // Create database if it doesn't exist
    if (rows.length === 0) {
      console.log(`Creating database: ${DB_NAME}`);
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
      console.log(`Database ${DB_NAME} created successfully`);
    } else {
      console.log(`Database ${DB_NAME} already exists`);
    }
    
    // Close connection
    await connection.end();
    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run initialization
initialize();
