// When the page is loaded, set up necessary values
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const errorMessage = urlParams.get('error');

    if (email) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = decodeURIComponent(email);
        }
    }

    if (errorMessage) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = decodeURIComponent(errorMessage);
        errorDiv.style.color = 'red';
        highlightErrorFields();
    }
};

function highlightErrorFields() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput && passwordInput) {
        emailInput.classList.add('error-input');
        passwordInput.classList.add('error-input');
    }
}

document.getElementById('email').addEventListener('input', function() {
    this.classList.remove('error-input');
    document.getElementById('error-message').textContent = '';
});

document.getElementById('password').addEventListener('input', function() {
    this.classList.remove('error-input');
    document.getElementById('error-message').textContent = '';
});

function updateCartIcon() {
    fetch('/get-cart')
    .then(response => response.json())
    .then(cart => {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        const cartIcon = document.getElementById('cart-item-count');
        cartIcon.textContent = `(${totalItems})`;
    })
    .catch(error => console.error('Error:', error));
}

document.getElementById('login-show-password').addEventListener('change', function() {
    const passwordInput = document.getElementById('password');
    passwordInput.type = this.checked ? 'text' : 'password';
});

function checkIfLoggedIn() {
    fetch('/check-login-status')
    .then(response => response.json())
    .then(data => {
        if (data.isLoggedIn) {
            const userNameSpan = document.getElementById('user-name');
            if (userNameSpan) {
                userNameSpan.textContent = data.userName;
            }
            
            const messageDiv = document.getElementById('already-logged-in-message');
            if (messageDiv) {
                messageDiv.textContent = `Welcome back, ${data.userName}! You are already logged in.`;
                messageDiv.style.display = 'block';
            }

            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.style.display = 'none';
            }
        }
    })
    .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    checkIfLoggedIn();
    updateCartIcon();
});
// When the page is loaded, set up necessary values
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const errorMessage = urlParams.get('error');

    if (email) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = decodeURIComponent(email);
        }
    }

    if (errorMessage) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = decodeURIComponent(errorMessage);
        errorDiv.style.color = 'red';
        highlightErrorFields();
    }
};

function highlightErrorFields() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput && passwordInput) {
        emailInput.classList.add('error-input');
        passwordInput.classList.add('error-input');
    }
}

document.getElementById('email').addEventListener('input', function() {
    this.classList.remove('error-input');
    document.getElementById('error-message').textContent = '';
});

document.getElementById('password').addEventListener('input', function() {
    this.classList.remove('error-input');
    document.getElementById('error-message').textContent = '';
});

function updateCartIcon() {
    fetch('/get-cart')
    .then(response => response.json())
    .then(cart => {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        const cartIcon = document.getElementById('cart-item-count');
        cartIcon.textContent = `(${totalItems})`;
    })
    .catch(error => console.error('Error:', error));
}

document.getElementById('login-show-password').addEventListener('change', function() {
    const passwordInput = document.getElementById('password');
    passwordInput.type = this.checked ? 'text' : 'password';
});

function checkIfLoggedIn() {
    fetch('/check-login-status')
    .then(response => response.json())
    .then(data => {
        if (data.isLoggedIn) {
            const userNameSpan = document.getElementById('user-name');
            if (userNameSpan) {
                userNameSpan.textContent = data.userName;
            }
            
            const messageDiv = document.getElementById('already-logged-in-message');
            if (messageDiv) {
                messageDiv.textContent = `Welcome back, ${data.userName}! You are already logged in.`;
                messageDiv.style.display = 'block';
            }

            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.style.display = 'none';
            }
        }
    })
    .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    checkIfLoggedIn();
    updateCartIcon();
});

document.addEventListener('DOMContentLoaded', function() {
    // Check login status and set username
    fetch('/check-login-status')
    .then(response => response.json())
    .then(data => {
        if (data.isLoggedIn) {
            // User is logged in, display the username
            const userName = data.userName; // Assuming the username is returned from the server
            document.getElementById('user-name').textContent = userName;
            // Make the dropdown clickable by adding 'dropdown-toggle' class
            const profileLink = document.getElementById('navbarDropdown');
            profileLink.classList.add('dropdown-toggle');
            profileLink.setAttribute('data-toggle', 'dropdown');
        } else {
            // User is not logged in, hide the dropdown toggle functionality
            document.getElementById('navbarDropdown').remove();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

    // Event listener for the logout button
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logoutUser();
        });
    }
});

function logoutUser() {
    // AJAX request to the server's logout route
    fetch('/logout', {
        method: 'POST',
        // Add any necessary headers, credentials, or body data here
        headers: {
            'Content-Type': 'application/json'
            // Include credentials if necessary: 'credentials': 'include'
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Log out actions here (e.g., redirect to login page)
            window.location.href = '/login.html';
        } else {
            // Handle logout failure
            alert('Logout failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

