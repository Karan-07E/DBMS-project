// Orders page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        // Redirect to login if not logged in
        alert('Please log in to view your orders.');
        window.location.href = 'login.html';
        return;
    }
    
    // Load orders
    loadOrders();
    
    // Set up logout functionality
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Update user menu display
    updateUserMenuDisplay();
    
    // Update cart count on page load
    updateCartCount();
});

// Load orders from API
function loadOrders() {
    const token = localStorage.getItem('token');
    const ordersContainer = document.getElementById('orders-container');
    
    if (!ordersContainer) {
        console.error('Orders container not found');
        return;
    }
    
    // Show loading state
    ordersContainer.innerHTML = '<div class="loading">Loading your orders...</div>';
    
    // Fetch orders from API
    fetch('/api/orders/myorders', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        return response.json();
    })
    .then(orders => {
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<div class="no-orders">You have not placed any orders yet.</div>';
            return;
        }
        
        // Clear loading message
        ordersContainer.innerHTML = '';
        
        // Create orders list
        const ordersList = document.createElement('div');
        ordersList.className = 'orders-list';
        
        // Sort orders by date (newest first)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Display each order
        orders.forEach(order => {
            const orderElement = createOrderElement(order);
            ordersList.appendChild(orderElement);
        });
        
        ordersContainer.appendChild(ordersList);
    })
    .catch(error => {
        console.error('Error loading orders:', error);
        ordersContainer.innerHTML = '<div class="error">Failed to load orders. Please try again later.</div>';
    });
}

// Create HTML element for an order
function createOrderElement(order) {
    const orderDate = new Date(order.createdAt);
    
    const orderElement = document.createElement('div');
    orderElement.className = 'order-card';
    
    // Determine status class for styling
    let statusClass = 'status-pending';
    if (order.status === 'processing') statusClass = 'status-processing';
    if (order.status === 'shipped') statusClass = 'status-shipped';
    if (order.status === 'delivered') statusClass = 'status-delivered';
    
    // Calculate order summary
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    orderElement.innerHTML = `
        <div class="order-header">
            <div class="order-id">Order #${order.id}</div>
            <div class="order-status ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</div>
        </div>
        <div class="order-details">
            <div class="order-date">Placed on ${orderDate.toLocaleDateString()} at ${orderDate.toLocaleTimeString()}</div>
            <div class="order-summary">
                <div class="order-items-count">${totalItems} item${totalItems !== 1 ? 's' : ''}</div>
                <div class="order-total">Total: ${formatPrice(order.totalPrice || order.total || 0)}</div>
            </div>
        </div>
        <div class="order-items">
            ${order.items.map(item => `
                <div class="order-item">
                    <img src="${item.image || 'images/placeholder.jpg'}" 
                         alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
                    <div class="order-item-details">
                        <div class="order-item-name">${item.name}</div>
                        <div class="order-item-meta">
                            <span>Qty: ${item.quantity}</span>
                            <span>${formatPrice(item.price)} each</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="order-actions">
            <a href="order-confirmation.html?id=${order.id}" class="btn btn-sm">View Details</a>
        </div>
    `;
    
    return orderElement;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('You have been logged out successfully.');
    window.location.href = 'index.html';
}

// Update user menu display
function updateUserMenuDisplay() {
    const token = localStorage.getItem('token');
    
    // Show/hide auth links
    const authLinks = document.querySelectorAll('.auth-link');
    const userLinks = document.querySelectorAll('.user-link');
    
    if (token) {
        // Hide login/register, show user links
        authLinks.forEach(link => link.style.display = 'none');
        userLinks.forEach(link => link.style.display = 'inline-block');
    } else {
        // Show login/register, hide user links
        authLinks.forEach(link => link.style.display = 'inline-block');
        userLinks.forEach(link => link.style.display = 'none');
    }
    
    // Set up logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
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

// Helper function to format price
function formatPrice(price) {
    const numPrice = parseFloat(price) || 0;
    return '$' + numPrice.toFixed(2);
}
