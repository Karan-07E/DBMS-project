// Cart functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    // Load cart items
    loadCart();
    
    // Set up event listeners for cart actions
    setupCartActions();
    
    // Handle checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            // Check if user is logged in
            if (!token) {
                // Save return URL
                localStorage.setItem('returnUrl', window.location.href);
                
                // Alert user
                alert('Please log in to proceed to checkout.');
                
                // Redirect to login
                window.location.href = 'login.html';
                return;
            }
            
            // Proceed to checkout
            window.location.href = 'checkout.html';
        });
    }
});

// Load cart items from localStorage
function loadCart() {
    const cartTable = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartEmpty = document.getElementById('cart-empty');
    const cartActions = document.getElementById('cart-actions');
    
    // Get cart items
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Update cart UI
    if (cartItems.length === 0) {
        // Cart is empty
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartTable) cartTable.style.display = 'none';
        if (cartActions) cartActions.style.display = 'none';
        return;
    }
    
    // Cart has items
    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartTable) cartTable.style.display = 'table';
    if (cartActions) cartActions.style.display = 'block';
    
    // Clear existing cart items
    if (cartTable) {
        cartTable.querySelector('tbody').innerHTML = '';
        
        // Add each item to the cart table
        let totalPrice = 0;
        
        cartItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td data-label="Product" class="product-col">
                    <img src="${item.image || 'images/placeholder.jpg'}" 
                         alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
                    <a href="product-detail.html?id=${item.id}" class="cart-item-title">${item.name}</a>
                </td>
                <td data-label="Price" class="cart-item-price">${formatPrice(item.price)}</td>
                <td data-label="Quantity">
                    <div class="quantity-control">
                        <button class="quantity-btn minus-btn" data-index="${index}">-</button>
                        <input type="number" min="1" value="${item.quantity}" class="quantity-input" data-index="${index}">
                        <button class="quantity-btn plus-btn" data-index="${index}">+</button>
                    </div>
                </td>
                <td data-label="Total" class="cart-item-total">${formatPrice(itemTotal)}</td>
                <td data-label="Actions">
                    <button class="remove-item-btn" data-index="${index}">Remove</button>
                </td>
            `;
            
            cartTable.querySelector('tbody').appendChild(row);
        });
        
        // Update total price and total with tax (for display purposes)
        if (cartTotal) {
            cartTotal.textContent = formatPrice(totalPrice);
            
            // Update total with tax
            const cartTotalWithTax = document.getElementById('cart-total-with-tax');
            if (cartTotalWithTax) {
                // Assume 5% tax for example
                const tax = totalPrice * 0.05;
                const totalWithTax = totalPrice;
                cartTotalWithTax.textContent = formatPrice(totalWithTax);
            }
        }
    }
}

// Set up event listeners for cart actions
function setupCartActions() {
    // Handle quantity buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('minus-btn') || e.target.classList.contains('plus-btn')) {
            const index = parseInt(e.target.dataset.index);
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            
            if (e.target.classList.contains('minus-btn')) {
                // Decrease quantity
                if (cartItems[index].quantity > 1) {
                    cartItems[index].quantity--;
                }
            } else {
                // Increase quantity
                cartItems[index].quantity++;
            }
            
            // Save updated cart
            localStorage.setItem('cart', JSON.stringify(cartItems));
            
            // Reload cart UI
            loadCart();
            
            // Update cart count in header
            updateCartCount();
        }
    });
    
    // Handle quantity input changes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            const index = parseInt(e.target.dataset.index);
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Get new quantity
            let newQuantity = parseInt(e.target.value);
            
            // Validate quantity
            if (isNaN(newQuantity) || newQuantity < 1) {
                newQuantity = 1;
                e.target.value = 1;
            }
            
            // Update cart item
            cartItems[index].quantity = newQuantity;
            
            // Save updated cart
            localStorage.setItem('cart', JSON.stringify(cartItems));
            
            // Reload cart UI
            loadCart();
            
            // Update cart count in header
            updateCartCount();
        }
    });
    
    // Handle remove button
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item-btn')) {
            const index = parseInt(e.target.dataset.index);
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Show removal animation
            const row = e.target.closest('tr');
            if (row) {
                row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                row.style.opacity = '0';
                row.style.transform = 'translateX(20px)';
                
                setTimeout(() => {
                    // Remove item
                    cartItems.splice(index, 1);
                    
                    // Save updated cart
                    localStorage.setItem('cart', JSON.stringify(cartItems));
                    
                    // Reload cart UI
                    loadCart();
                    
                    // Update cart count in header
                    updateCartCount();
                }, 500);
            } else {
                // Fallback if animation doesn't work
                // Remove item
                cartItems.splice(index, 1);
                
                // Save updated cart
                localStorage.setItem('cart', JSON.stringify(cartItems));
                
                // Reload cart UI
                loadCart();
                
                // Update cart count in header
                updateCartCount();
            }
        }
    });
    
    // Handle clear cart button
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            // Clear cart
            localStorage.removeItem('cart');
            
            // Reload cart UI
            loadCart();
            
            // Update cart count in header
            updateCartCount();
        });
    }
}

// Update cart count in header
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = count;
    });
}