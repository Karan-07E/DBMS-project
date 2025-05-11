import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterForm from './components/RegisterForm';
import ProductForm from './components/ProductForm';
import Cart from './pages/Cart';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          {/* Add routes for RegisterForm and ProductForm */}
          <Route path="/admin/register" element={<RegisterForm />} />
          <Route path="/admin/product" element={<ProductForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
