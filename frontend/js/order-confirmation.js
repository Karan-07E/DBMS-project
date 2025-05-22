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
    
    // Add debug logging
    console.log('Loading order details for order ID:', orderId);
    
    fetch(`/api/orders/${orderId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        console.log('Order API response status:', response.status);
        if (!response.ok) {
            throw new Error(`Failed to load order details: ${response.status}`);
        }
        return response.json();
    })
    .then(order => {
        console.log('Order data received:', order);
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
    document.getElementById('customer-name').textContent = order.customerName || 'N/A';
    document.getElementById('customer-email').textContent = order.customerEmail || 'N/A';
    document.getElementById('customer-address').textContent = order.customerAddress || 'N/A';
    
    // Display order total
    if (document.getElementById('order-total')) {
        document.getElementById('order-total').textContent = formatPrice(order.totalPrice || 0);
    }
    
    // Display order items
    const orderItemsBody = document.getElementById('order-items-body');
    if (!orderItemsBody) {
        console.error('Order items table body element not found');
        return;
    }
    orderItemsBody.innerHTML = '';
    
    // Check if items is available in the order object or if it's in the 'items' property
    // Support different response formats (items might be directly in order or nested)
    let items = [];
    if (Array.isArray(order.items)) {
        items = order.items;
    } else if (order.items && Array.isArray(order.items.rows)) {
        items = order.items.rows;
    } else if (Array.isArray(order)) {
        items = order;
    }
    
    // Check if we have items to display
    if (!items || items.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" style="text-align: center;">No items found in this order.</td>
        `;
        orderItemsBody.appendChild(row);
    } else {
        items.forEach(item => {
            const row = document.createElement('tr');
            const itemPrice = parseFloat(item.price) || 0;
            const itemQuantity = parseInt(item.quantity) || 1;
            const itemTotal = itemPrice * itemQuantity;
            
            row.innerHTML = `
                <td data-label="Product" class="product-col">
                    <img src="${item.image || 'images/placeholder.jpg'}" 
                        alt="${item.name}" onerror="this.src='images/placeholder.jpg'" style="width:50px;height:50px;margin-right:10px;">
                    ${item.name || 'Unknown Product'}
                </td>
                <td data-label="Price">${formatPrice(itemPrice)}</td>
                <td data-label="Quantity">${itemQuantity}</td>
                <td data-label="Subtotal">${formatPrice(itemTotal)}</td>
            `;
            
            orderItemsBody.appendChild(row);
        });
    }
    
    // Display order summary
    const orderTotalElement = document.getElementById('order-total');
    if (orderTotalElement) {
        orderTotalElement.textContent = formatPrice(order.totalPrice || order.total || 0);
    }
    
    const orderDateElement = document.getElementById('order-date');
    if (orderDateElement) {
        orderDateElement.textContent = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A';
    }
    
    const orderStatusElement = document.getElementById('order-status');
    if (orderStatusElement) {
        const status = order.status || 'Processing';
        orderStatusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }
}

// formatPrice function is defined in main.js
// Add a fallback implementation in case it's not loaded
if (typeof formatPrice !== 'function') {
    function formatPrice(price) {
        const numPrice = parseFloat(price) || 0;
        return '$' + numPrice.toFixed(2);
    }
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