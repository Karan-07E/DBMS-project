// Email validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation (minimum 6 chars, at least one number and one letter)
const isValidPassword = (password) => {
    return password.length >= 6 && 
           /\d/.test(password) && 
           /[a-zA-Z]/.test(password);
};

// Product price validation
const isValidPrice = (price) => {
    return !isNaN(price) && price >= 0;
};

// Product stock validation
const isValidStock = (stock) => {
    return Number.isInteger(stock) && stock >= 0;
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidPrice,
    isValidStock
};