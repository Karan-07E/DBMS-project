// Script to reset the cart data
document.addEventListener('DOMContentLoaded', function() {
    // Clear any existing cart data to ensure we start fresh
    localStorage.removeItem('cart');
    console.log('Cart data has been reset');
    
    // Redirect to home page
    window.location.href = 'index.html';
});