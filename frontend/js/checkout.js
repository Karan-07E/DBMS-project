// Checkout functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        // Save return URL
        localStorage.setItem('returnUrl', window.location.href);
        
        alert('Please log in to proceed with checkout.');
        window.location.href = 'login.html';
        return;
    }
    
    // Load cart summary
    loadCheckoutSummary();
    
    // Set up checkout form
    setupCheckoutForm();
});

// Load checkout summary
function loadCheckoutSummary() {
    const orderSummaryItems = document.getElementById('order-summary-items');
    const orderSubtotal = document.getElementById('order-subtotal');
    const orderTotal = document.getElementById('order-total');
    
    // Get cart items
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cartItems.length === 0) {
        // Redirect if cart is empty
        alert('Your cart is empty. Add some products before checkout.');
        window.location.href = 'index.html';
        return;
    }
    
    // Clear existing summary
    if (orderSummaryItems) {
        orderSummaryItems.innerHTML = '';
        
        let subtotal = 0;
        
        // Add each item to summary
        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'summary-item';
            
            itemElement.innerHTML = `
                <div class="summary-item-image">
                    <img src="${item.image || 'images/placeholder.jpg'}" alt="${item.name}" 
                         onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="summary-item-details">
                    <div class="summary-item-name">${item.name} x ${item.quantity}</div>
                    <div class="summary-item-price">${formatPrice(itemTotal)}</div>
                </div>
            `;
            
            orderSummaryItems.appendChild(itemElement);
        });
        
        // Update subtotal and total
        if (orderSubtotal) orderSubtotal.textContent = formatPrice(subtotal);
        if (orderTotal) orderTotal.textContent = formatPrice(subtotal);  // In a real app, you'd add shipping, tax, etc.
    }
}

// Set up checkout form
function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (checkoutForm && user) {
        // Pre-fill email with logged in user's email
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.value = user.email;
        
        // Pre-fill name if available
        const nameInput = document.getElementById('name');
        if (nameInput && user.name) nameInput.value = user.name;
        
        // Form submission
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(checkoutForm);
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Calculate total
            const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Prepare order data
            const orderData = {
                shippingAddress: formData.get('address'),
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };
            
            // Submit order
            submitOrder(orderData);
        });
    }
}

// Submit order to server
function submitOrder(orderData) {
    const token = localStorage.getItem('token');
    
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
        // Clear cart
        localStorage.removeItem('cart');
        
        // Show success message
        alert('Order placed successfully! Thank you for your purchase.');
        
        // Handle different order response formats
        let orderId = '';
        if (data.order && data.order.id) {
            orderId = data.order.id;
        } else if (data.id) {
            orderId = data.id;
        } else if (data && typeof data === 'object') {
            // Try to find an id field at any level
            orderId = data.id || '';
        }
        
        console.log('Order created with ID:', orderId);
        
        // Redirect to order confirmation page with the order ID
        window.location.href = 'order-confirmation.html?id=' + orderId;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to place your order. Please try again.');
    });
}