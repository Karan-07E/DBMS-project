// Product-related JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Update cart count on page load
    updateCartCount();
    
    // Load products on the homepage
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        loadProducts();
    }
    
    // Load single product detail page
    const productDetail = document.getElementById('product-detail');
    if (productDetail) {
        const productId = getUrlParameter('id');
        if (productId) {
            loadProductDetail(productId);
        }
    }
    
    // Debug information
    console.log('products.js loaded');
    console.log('Product grid element exists:', !!document.getElementById('product-grid'));
});

// Load all products
function loadProducts() {
    const productGrid = document.getElementById('product-grid');
    
    if (!productGrid) {
        console.error('Product grid element not found');
        return;
    }
    
    console.log('Loading products...');
    
    // Show loading message
    productGrid.innerHTML = '<div class="loading">Loading products...</div>';
    
    // Fetch products from API
    fetch('/api/products')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch products from server');
            }
            return response.json();
        })
        .then(products => {
            // Clear the product grid
            productGrid.innerHTML = '';
            
            // Check if we have any products
            if (products.length === 0) {
                productGrid.innerHTML = '<div class="no-products">No products available at this time.</div>';
                return;
            }
            
            console.log('Products fetched:', products.length, 'items');
            
            // Loop through products and create product cards
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                    <h3>${product.name}</h3>
                    <p class="product-price">${formatPrice(product.price)}</p>
                    <p class="product-description">${product.description.substring(0, 80)}${product.description.length > 80 ? '...' : ''}</p>
                    <button class="add-to-cart-btn" data-id="${product._id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
                    <a href="product-detail.html?id=${product._id}" class="view-details-btn">View Details</a>
                `;
                
                productGrid.appendChild(productCard);
            });
            
            console.log(`${products.length} products loaded successfully`);
            
            // Add event listeners to all "Add to Cart" buttons
            const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
            addToCartBtns.forEach(button => {
                button.addEventListener('click', function() {
                    // Check if user is logged in
                    const token = localStorage.getItem('token');
                    if (!token) {
                        // Save product to localStorage for later
                        const productId = this.dataset.id;
                        localStorage.setItem('pendingProductId', productId);
                        
                        // Set the return URL
                        localStorage.setItem('returnUrl', window.location.href);
                        
                        // Show alert
                        alert('Please log in to add products to your cart.');
                        
                        // Redirect to login page
                        window.location.href = 'login.html';
                        return;
                    }
                    
                    // User is logged in, add to cart as normal
                    const productId = this.dataset.id;
                    const productName = this.dataset.name;
                    const productPrice = parseFloat(this.dataset.price);
                    
                    // Find the image URL from the product card
                    const productCard = this.closest('.product-card');
                    let productImage = '';
                    if (productCard) {
                        const imgElement = productCard.querySelector('img');
                        if (imgElement) {
                            productImage = imgElement.src;
                        }
                    }
                    
                    addToCart(productId, productName, productPrice, 1, productImage);
                });
            });
        })
        .catch(error => {
            console.error('Error loading products:', error);
            productGrid.innerHTML = '<div class="error-message">Failed to load products. Please try again later.</div>';
        });
}

// formatPrice function is defined in main.js

// Get URL parameter by name
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Add product to cart
function addToCart(id, name, price, quantity = 1, image = '') {
    console.log('Adding to cart:', id, name, price, quantity);
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already in cart
    const existingItemIndex = cartItems.findIndex(item => item.id === id);
    
    if (existingItemIndex !== -1) {
        // Update quantity if item already exists
        cartItems[existingItemIndex].quantity += quantity;
        
        // Make sure we have the image
        if (image && !cartItems[existingItemIndex].image) {
            cartItems[existingItemIndex].image = image;
        }
    } else {
        // Add new item
        cartItems.push({
            id,
            name,
            price,
            quantity,
            image
        });
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    alert(`${name} added to cart!`);
}

// Update cart count in header
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        if (element) element.textContent = count;
    });
}

// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id) {
    // MongoDB ObjectId is a 24-character hex string
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    return objectIdPattern.test(id);
}

// Load single product detail
function loadProductDetail(productId) {
    const productDetail = document.getElementById('product-detail');
    
    if (!productDetail) {
        console.error('Product detail container not found');
        return;
    }
    
    // Show loading message
    productDetail.innerHTML = '<div class="loading">Loading product details...</div>';
    
    // Check if the ID is a valid MongoDB ObjectId
    if (!isValidObjectId(productId)) {
        console.error('Invalid product ID format:', productId);
        productDetail.innerHTML = '<div class="error-message">Invalid product ID format. Please return to the <a href="index.html">home page</a> and try again.</div>';
        return;
    }
    
    console.log('Fetching product with ID:', productId);
    
    // Fetch product details from API
    fetch(`/api/products/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Product not found');
            }
            return response.json();
        })
        .then(product => {
            displayProductDetail(product, productDetail);
        })
        .catch(error => {
            console.error('Error loading product:', error);
            productDetail.innerHTML = '<div class="error-message">Product not found or could not be loaded. Please return to the <a href="index.html">home page</a>.</div>';
        });
}

// Display product details
function displayProductDetail(product, container) {
    if (!product) {
        container.innerHTML = '<div class="error-message">Product not found</div>';
        return;
    }
    
    // Render the product details
    container.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
        </div>
        <div class="product-info">
            <h2>${product.name}</h2>
            <p class="product-price">${formatPrice(product.price)}</p>
            <p class="product-description">${product.description}</p>
            <div class="product-actions">
                <input type="number" id="quantity" min="1" value="1">
                <button id="add-to-cart-btn" class="add-to-cart-btn" data-id="${product._id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
            </div>
        </div>
    `;
    
    // Add event listener for the "Add to Cart" button
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const quantityInput = document.getElementById('quantity');
    
    if (addToCartBtn && quantityInput) {
        addToCartBtn.addEventListener('click', function() {
            // Check if user is logged in
            const token = localStorage.getItem('token');
            if (!token) {
                // Save product and quantity for later
                const productId = this.dataset.id;
                const quantity = parseInt(quantityInput.value);
                
                localStorage.setItem('pendingProductId', productId);
                localStorage.setItem('pendingProductQuantity', quantity);
                
                // Set the return URL
                localStorage.setItem('returnUrl', window.location.href);
                
                // Show alert
                alert('Please log in to add products to your cart.');
                
                // Redirect to login page
                window.location.href = 'login.html';
                return;
            }
            
            // User is logged in, add to cart as normal
            const productId = this.dataset.id;
            const productName = this.dataset.name;
            const productPrice = parseFloat(this.dataset.price);
            const quantity = parseInt(quantityInput.value);
            
            // Get image URL from the product detail
            let productImage = '';
            const imgElement = document.querySelector('.product-image img');
            if (imgElement) {
                productImage = imgElement.src;
            }
            
            addToCart(productId, productName, productPrice, quantity, productImage);
        });
    }
}
