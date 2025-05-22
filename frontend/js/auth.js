// Authentication related JavaScript

document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    updateCurrentTime();
    
    // Set interval to update current time
    setInterval(updateCurrentTime, 60000); // Update every minute
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            login(email, password);
        });
    }
    
    // Register form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameField = document.getElementById('name');
            const emailField = document.getElementById('email');
            const passwordField = document.getElementById('password');
            const confirmPasswordField = document.getElementById('confirm-password');
            
            if (!nameField || !emailField || !passwordField || !confirmPasswordField) {
                console.error('One or more form fields are missing.');
                showMessage('register-message', 'Error: Missing form fields', 'error');
                return;
            }

            const name = nameField.value;
            const email = emailField.value;
            const password = passwordField.value;
            const confirmPassword = confirmPasswordField.value;
            
            if (password !== confirmPassword) {
                showMessage('register-message', 'Passwords do not match!', 'error');
                return;
            }

            register(name, email, password);
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
});

// Login function
function login(email, password) {
    fetch('/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    })
    .then(data => {
    if (!data || !data.token) {
        throw new Error('Invalid response format from server');
    }
    
    // Store token
    localStorage.setItem('token', data.token);
    
    // Store user data (removing the token property as it's redundant)
    const userData = {...data};
    delete userData.token;
    localStorage.setItem('user', JSON.stringify(userData));
        
        showMessage('login-message', 'Login successful! Redirecting...', 'success');
        
        // Check if there's a pending product and return URL
        const pendingProductId = localStorage.getItem('pendingProductId');
        const returnUrl = localStorage.getItem('returnUrl');
        
        // Clear the stored values
        localStorage.removeItem('pendingProductId');
        localStorage.removeItem('pendingProductQuantity');
        
        setTimeout(() => {
            if (returnUrl) {
                // Clear the return URL and redirect user back to where they were
                localStorage.removeItem('returnUrl');
                window.location.href = returnUrl;
            } else {
                window.location.href = 'index.html';
            }
        }, 1500);
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('login-message', 'Invalid email or password', 'error');
    });
}

// Register function
function register(name, email, password) {
    fetch('/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Registration failed');
            });
        }
        return response.json();
    })
    .then(data => {
        showMessage('register-message', 'Registration successful! Please login.', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('register-message', error.message || 'Registration failed', 'error');
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

// Update auth UI elements based on login status
// Update auth UI elements based on login status
function updateAuthUI() {
    let user = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            user = JSON.parse(userStr);
        }
    } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        localStorage.removeItem('user'); // Clear corrupted data
    }
    
    const token = localStorage.getItem('token');
    
    const loginNavItem = document.createElement('li');
    
    // Update header navigation
    const navUl = document.querySelector('header nav ul');
    
    // Remove existing auth nav items
    const existingAuthItems = document.querySelectorAll('.auth-nav-item');
    existingAuthItems.forEach(item => item.remove());
    
    if (user && token) {
        // User is logged in
        loginNavItem.className = 'auth-nav-item';
        loginNavItem.innerHTML = `<a href="profile.html">${user.name || 'Profile'}</a>`;
        
        // If on profile page, update profile info
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileCreated = document.getElementById('profile-created');
        const profileLastLogin = document.getElementById('profile-last-login');
        const currentUser = document.getElementById('current-user');
        
        if (profileName && profileEmail && profileCreated && currentUser) {
            profileName.textContent = user.name || 'N/A';
            profileEmail.textContent = user.email || 'N/A';
            profileCreated.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
            profileLastLogin.textContent = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A';
            currentUser.textContent = user.name || 'User';
        }
    } else {
        // User is not logged in
        loginNavItem.className = 'auth-nav-item';
        loginNavItem.innerHTML = '<a href="login.html">Login</a>';
        
        // Redirect if on profile page
        if (window.location.pathname.includes('profile.html')) {
            window.location.href = 'login.html';
        }
    }
    
    if (navUl) {
        navUl.appendChild(loginNavItem);
    }
}

// Show message in message container
function showMessage(containerId, message, type) {
    const container = document.getElementById(containerId);
    if (container) {
        container.textContent = message;
        container.className = type === 'error' ? 'error-message' : 'success-message';
        container.style.display = 'block';
    }
}

// Update current time display
function updateCurrentTime() {
    const currentTimeElements = document.querySelectorAll('#current-time');
    const now = new Date();
    const formattedTime = formatDateTime(now);
    
    currentTimeElements.forEach(element => {
        element.textContent = formattedTime;
    });
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