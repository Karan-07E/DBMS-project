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
    let user;
    try {
        const userStr = localStorage.getItem('user');
        user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        console.error('Error parsing user data:', e);
        user = null;
    }
    
    if (!user) {
        console.error('No user data found in localStorage');
        return;
    }
    
    console.log('User data:', user);
    
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileCreated = document.getElementById('profile-created');
    const profileLastLogin = document.getElementById('profile-last-login');
    
    if (profileName) profileName.textContent = user.name || 'N/A';
    if (profileEmail) profileEmail.textContent = user.email || 'N/A';
    
    // Handle createdAt date with better error checking
    if (profileCreated) {
        if (user.createdAt) {
            try {
                const createdDate = new Date(user.createdAt);
                if (!isNaN(createdDate.getTime())) {
                    profileCreated.textContent = formatDateTime(createdDate);
                } else {
                    profileCreated.textContent = 'N/A';
                }
            } catch (e) {
                console.error('Error formatting createdAt date:', e);
                profileCreated.textContent = 'N/A';
            }
        } else {
            profileCreated.textContent = 'N/A';
        }
    }
    
    // Handle lastLogin date with better error checking
    if (profileLastLogin) {
        if (user.lastLogin) {
            try {
                const loginDate = new Date(user.lastLogin);
                if (!isNaN(loginDate.getTime())) {
                    profileLastLogin.textContent = formatDateTime(loginDate);
                } else {
                    profileLastLogin.textContent = 'N/A';
                }
            } catch (e) {
                console.error('Error formatting lastLogin date:', e);
                profileLastLogin.textContent = 'N/A';
            }
        } else {
            profileLastLogin.textContent = 'N/A';
        }
    }
}

// Load order history
function loadOrderHistory() {
    const token = localStorage.getItem('token');
    const orderHistoryList = document.getElementById('order-history-list');
    
    if (!token || !orderHistoryList) return;
    
    // Show loading state
    orderHistoryList.innerHTML = '<p>Loading order history...</p>';
    
    console.log('Fetching order history with token:', token.substring(0, 10) + '...');
    
    fetch('/api/orders/myorders', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        console.log('Order history API response status:', response.status);
        if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.status}`);
        }
        return response.json();
    })
    .then(orders => {
        console.log('Orders received:', orders);
        
        if (!orders || orders.length === 0) {
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
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-status ${statusClass}">${order.status}</span>
                </div>
                <div class="order-details">
                    <div class="order-date">Placed on: ${formatDateTime(orderDate)}</div>
                    <div class="order-total">Total: ${formatPrice(order.totalPrice || order.total || 0)}</div>
                </div>
                <div class="order-items">
                    ${(order.items && Array.isArray(order.items)) ? 
                        order.items.map(item => `
                            <div class="order-item-product">
                                <img src="${item.image || 'images/placeholder.jpg'}" alt="${item.name}" 
                                     onerror="this.src='images/placeholder.jpg'">
                                <div class="order-item-details">
                                    <span class="order-item-name">${item.name || 'Product'}</span>
                                    <span class="order-item-quantity">Quantity: ${item.quantity}</span>
                                    <span class="order-item-price">${formatPrice(item.price)} each</span>
                                </div>
                            </div>
                        `).join('') : 
                        '<div>No items found</div>'
                    }
                </div>
                <a href="order-confirmation.html?id=${order.id}" class="view-order-btn">View Order Details</a>
            `;
            
            orderHistoryList.appendChild(orderElement);
        });
    })
    .catch(error => {
        console.error('Error loading order history:', error);
        orderHistoryList.innerHTML = `<p>Failed to load order history. Please try again later.</p>
                                      <p class="error-details" style="color: #888; font-size: 0.8em;">
                                      Error: ${error.message}</p>`;
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

// Fallback formatPrice function if main.js one isn't available
if (typeof formatPrice !== 'function') {
    function formatPrice(price) {
        const numPrice = parseFloat(price) || 0;
        return '$' + numPrice.toFixed(2);
    }
}