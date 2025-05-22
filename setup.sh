#!/bin/bash
# Setup script for E-commerce application

echo "Setting up E-commerce application..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Initialize the database
echo "Initializing database..."
npm run init-db

# Seed the database
echo "Seeding database with sample data..."
npm run seed

echo "Setup completed! Run 'npm run dev' to start the development server."
