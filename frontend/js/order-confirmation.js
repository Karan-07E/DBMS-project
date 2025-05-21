// Order Confirmation JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Update cart count on page load
    updateCartCount();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        // Redirect to login if not authenticated
        alert('Please log in to view your order.');
        window.location.href = 'login.html';
        return;
    }
    
    // Get order ID from URL
    const orderId = getUrlParameter('id');
    if (orderId) {
        // Display order ID
        document.getElementById('order-id').textContent = orderId;
        
        // Load order details
        loadOrderDetails(orderId);
    } else {
        // No order ID provided
        document.getElementById('order-loading').textContent = 'No order ID provided.';
    }
});

// Get URL parameter by name
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Load order details
function loadOrderDetails(orderId) {
    const token = localStorage.getItem('token');
    
    fetch(`/api/orders/${orderId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load order details');
        }
        return response.json();
    })
    .then(order => {
        displayOrderDetails(order);
    })
    .catch(error => {
        console.error('Error loading order details:', error);
        document.getElementById('order-loading').style.display = 'none';
        document.getElementById('order-error').style.display = 'block';
        document.getElementById('order-error').textContent = 'Could not load order details. Please try again later.';
    });
}

// Display order details
function displayOrderDetails(order) {
    // Hide loading message
    document.getElementById('order-loading').style.display = 'none';
    
    // Show order info
    document.getElementById('order-info').style.display = 'block';
    
    // Display customer information
    document.getElementById('customer-name').textContent = order.customer.name;
    document.getElementById('customer-email').textContent = order.customer.email;
    document.getElementById('customer-address').textContent = order.customer.address;
    
    // Display order items
    const orderItemsBody = document.getElementById('order-items-body');
    orderItemsBody.innerHTML = '';
    
    order.items.forEach(item => {
        const row = document.createElement('tr');
        const itemTotal = item.price * item.quantity;
        
        row.innerHTML = `
            <td data-label="Product" class="product-col">
                <img src="${item.image || 'images/placeholder.jpg'}" 
                     alt="${item.name}" onerror="this.src='images/placeholder.jpg'" style="width:50px;height:50px;margin-right:10px;">
                ${item.name}
            </td>
            <td data-label="Price">${formatPrice(item.price)}</td>
            <td data-label="Quantity">${item.quantity}</td>
            <td data-label="Subtotal">${formatPrice(itemTotal)}</td>
        `;
        
        orderItemsBody.appendChild(row);
    });
    
    // Display order summary
    document.getElementById('order-total').textContent = formatPrice(order.total);
    document.getElementById('order-date').textContent = new Date(order.createdAt).toLocaleString();
    document.getElementById('order-status').textContent = order.status.charAt(0).toUpperCase() + order.status.slice(1);
}

// formatPrice function is defined in main.js

// Update cart count in header
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        if (element) element.textContent = count;
    });
}