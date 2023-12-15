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


document.addEventListener('DOMContentLoaded', updateCartIcon);

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
