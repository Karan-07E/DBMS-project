# E-commerce Website

A simple e-commerce website built with HTML, CSS, JavaScript, Node.js, Express, and MongoDB Atlas.

## Features

- User authentication and account management
- Product browsing and details
- Shopping cart functionality
- Secure checkout process
- Order history
- Time tracking and display

## Prerequisites

- Node.js (v14 or later)
- MongoDB Atlas account

## Installation

1. Clone the repository : git clone https://github.com/yourusername/ecommerce-website.git 
    cd ecommerce-website
 
2. Install dependencies: npm install

3. Configure MongoDB:
- Create a MongoDB Atlas account
- Set up a cluster and database
- Update the connection string in `backend/db/conn.js`

4. Start the server: npm start

5. Open in browser:
- Navigate to `http://localhost:3000`

## Development

Run the development server with hot reloading: npm run dev


## Project Structure

- `frontend/` - HTML, CSS, and client-side JavaScript
- `backend/` - Express server and API endpoints
- `backend/models/` - MongoDB schema definitions
- `backend/middleware/` - Express middleware

## License

MIT