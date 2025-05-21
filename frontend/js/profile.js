document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update profile information
    updateProfileInfo();
    
    // Load order history
    loadOrderHistory();
    
    // Set up logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Update current user display
    const currentUserElem = document.getElementById('current-user');
    if (currentUserElem && user) {
        currentUserElem.textContent = user.name;
    }
    
    // Start the current time update
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

// Update profile information
function updateProfileInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileCreated = document.getElementById('profile-created');
    const profileLastLogin = document.getElementById('profile-last-login');
    
    if (profileName) profileName.textContent = user.name;
    if (profileEmail) profileEmail.textContent = user.email;
    
    if (profileCreated && user.createdAt) {
        const createdDate = new Date(user.createdAt);
        profileCreated.textContent = formatDateTime(createdDate);
    }
    
    if (profileLastLogin && user.lastLogin) {
        const loginDate = new Date(user.lastLogin);
        profileLastLogin.textContent = formatDateTime(loginDate);
    } else if (profileLastLogin) {
        profileLastLogin.textContent = 'N/A';
    }
}

// Load order history
function loadOrderHistory() {
    const token = localStorage.getItem('token');
    const orderHistoryList = document.getElementById('order-history-list');
    
    if (!token || !orderHistoryList) return;
    
    fetch('/api/orders/my-orders', {
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
            orderHistoryList.innerHTML = '<p>You have not placed any orders yet.</p>';
            return;
        }
        
        orderHistoryList.innerHTML = '';
        
        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            
            // Determine the status style
            let statusClass = 'pending';
            if (order.status.toLowerCase() === 'processing') statusClass = 'processing';
            if (order.status.toLowerCase() === 'shipped') statusClass = 'shipped';
            if (order.status.toLowerCase() === 'delivered') statusClass = 'delivered';
            if (order.status.toLowerCase() === 'cancelled') statusClass = 'cancelled';
            
            orderElement.innerHTML = `
                <div class="order-header">
                    <span class="order-id">Order #${order._id.substring(0, 8)}...</span>
                    <span class="order-status ${statusClass}">${order.status}</span>
                </div>
                <div class="order-details">
                    <div class="order-date">Placed on: ${formatDateTime(orderDate)}</div>
                    <div class="order-total">Total: ${formatPrice(order.total)}</div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item-product">
                            <img src="${item.image || 'images/placeholder.jpg'}" alt="${item.name}" 
                                 onerror="this.src='images/placeholder.jpg'">
                            <div class="order-item-details">
                                <span class="order-item-name">${item.name}</span>
                                <span class="order-item-quantity">Quantity: ${item.quantity}</span>
                                <span class="order-item-price">${formatPrice(item.price)} each</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <a href="order-confirmation.html?id=${order._id}" class="view-order-btn">View Order Details</a>
            `;
            
            orderHistoryList.appendChild(orderElement);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        orderHistoryList.innerHTML = '<p>Failed to load order history. Please try again later.</p>';
    });
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    showMessage('profile-message', 'Logged out successfully! Redirecting...', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Update current time display
function updateCurrentTime() {
    const currentTimeElem = document.getElementById('current-time');
    if (currentTimeElem) {
        const now = new Date();
        currentTimeElem.textContent = formatDateTime(now);
    }
}

// Format date time in UTC YYYY-MM-DD HH:MM:SS format
function formatDateTime(date) {
    const d = date || new Date();
    
    // Get UTC values
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    const seconds = String(d.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Show message in container
function showMessage(containerId, message, type) {
    const container = document.getElementById(containerId);
    if (container) {
        container.textContent = message;
        container.className = type === 'error' ? 'error-message' : 'success-message';
    }
}