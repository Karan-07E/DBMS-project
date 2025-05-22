#!/bin/bash
# Database reset script for E-commerce application

echo "Resetting the database for E-commerce application..."

# Run the initialize database script
echo "Initializing database..."
npm run init-db

# Run the seed script to populate the database with sample data
echo "Seeding database with sample data..."
npm run seed

echo "Database reset completed successfully!"
echo "You can now start the application with 'npm run dev'"
