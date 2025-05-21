// Global variables and utility functions
// Always get the latest cart from localStorage
function getCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Initialize cart count
updateCartCount();

// Update cart count in the header
function updateCartCount() {
    const cartItems = getCartItems();
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = cartItems.reduce((total, item) => total + item.quantity, 0);
    });
}

// Format price
function formatPrice(price) {
    // Ensure price is a number and handle edge cases
    const numPrice = parseFloat(price) || 0;
    return '$' + numPrice.toFixed(2);
}

// Get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Save cart to localStorage
function saveCart(cartItems) {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartCount();
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

// Update current time display
function updateCurrentTime() {
    const currentTimeElements = document.querySelectorAll('#current-time');
    const now = new Date();
    const formattedTime = formatDateTime(now);
    
    currentTimeElements.forEach(element => {
        element.textContent = formattedTime;
    });
    
    // Update current user display
    const currentUserElements = document.querySelectorAll('#current-user');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
        currentUserElements.forEach(element => {
            if (element) element.textContent = user.name;
        });
    }
}

// Update time on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    
    // Set interval to update current time
    setInterval(updateCurrentTime, 60000); // Update every minute
    
    // Order submission
    const checkoutForm = document.getElementById('checkout-form');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check if user is logged in
            const token = localStorage.getItem('token');
            if (!token) {
                // Redirect to login page with return URL
                window.location.href = `login.html?returnUrl=${encodeURIComponent(window.location.href)}`;
                return;
            }
            
            // Get form data
            const formData = new FormData(checkoutForm);
            const orderData = {
                customer: {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    address: formData.get('address')
                },
                items: cartItems,
                total: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
            };
            
            // Send order to server
            fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Order submission failed');
                }
                return response.json();
            })
            .then(data => {
                alert('Order placed successfully! Thank you for your purchase.');
                
                // Clear cart and redirect to home page
                localStorage.removeItem('cart');
                window.location.href = 'index.html';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to place order. Please try again.');
            });
        });
    }
    
    // Update auth UI
    updateAuthUI();
});

// Check if user is logged in and update UI
function updateAuthUI() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Update header
    const navUl = document.querySelector('header nav ul');
    
    if (navUl) {
        // Remove existing auth items
        const existingAuthItems = document.querySelectorAll('.auth-nav-item');
        existingAuthItems.forEach(item => item.remove());
        
        // Create new auth item
        const authNavItem = document.createElement('li');
        authNavItem.className = 'auth-nav-item';
        
        if (user && token) {
            authNavItem.innerHTML = `<a href="profile.html">${user.name}</a>`;
        } else {
            authNavItem.innerHTML = '<a href="login.html">Login</a>';
        }
        
        navUl.appendChild(authNavItem);
    }
}

