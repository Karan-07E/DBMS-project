# E-commerce Website

A simple e-commerce website built with HTML, CSS, JavaScript, Node.js, Express, and MySQL database backend.

## Features

- User authentication and account management
- Product browsing and details
- Shopping cart functionality
- Secure checkout process
- Order history
- Request time logging and performance monitoring
- MySQL database with Sequelize ORM support

## Prerequisites

- Node.js (v14 or later)
- MySQL (v5.7 or later)

## Installation

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure the database:
   - Make sure MySQL is installed and running
   - Update the `.env` file with your MySQL credentials if needed:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=ecom
     DB_PORT=3306
     ```

3. Initialize and seed the database:
   ```bash
   # Create the database if it doesn't exist
   npm run init-db
   
   # Seed the database with sample data
   npm run seed
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open in browser:
   - Navigate to `http://localhost:3000`

## Database Management

This project uses Sequelize ORM for database operations.

### Database Initialization

To create the database:
```bash
npm run init-db
```

### Database Seeding

To populate your database with sample data:
```bash
npm run seed
```

## Development

Run the development server with hot reloading:
```bash
npm run dev
```


## Project Structure

- `frontend/` - HTML, CSS, and client-side JavaScript
- `backend/` - Express server and API endpoints
- `backend/models/` - Sequelize model definitions
- `backend/middleware/` - Express middleware

## License

MIT