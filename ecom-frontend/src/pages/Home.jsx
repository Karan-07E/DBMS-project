import React, { useEffect, useState } from 'react';
import ProductCard from '../components/Productcard';
import axios from 'axios';

function Home() {
    const [products, setProducts] = useState([]);
  
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/products');
          setProducts(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchProducts();
    }, []);
  
  return (
    <div>
      <h2>Welcome to My E-Commerce</h2>
      <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} /> // Use a unique identifier
      ))}
      </div>
    </div>
  );
}

export default Home;
