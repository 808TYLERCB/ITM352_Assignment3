document.addEventListener('DOMContentLoaded', () => {
    fetch('/get-cart')
        .then(response => response.json())
        .then(cartItems => {
            populateInvoiceTable(cartItems);
            updateInvoiceTotals(cartItems);
        })
        .catch(error => console.error('Error:', error));
});

function populateInvoiceTable(cartItems) {
    const invoiceBody = document.getElementById('invoice-body');
    invoiceBody.innerHTML = ''; // Clear existing table data

    cartItems.forEach(item => {
        const row = document.createElement('tr');

        // Create an image element with a tooltip
        const imgElement = `<img src="${item.image}" alt="${item.name}" title="${item.description}" style="width: 50px; height: auto;">`;

        row.innerHTML = `
            <td>${imgElement} ${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${(item.quantity * item.price).toFixed(2)}</td>
        `;

        invoiceBody.appendChild(row);
    });
}

function updateInvoiceTotals(cartItems) {
    let subtotal = 0;
    let totalQuantity = 0;

    cartItems.forEach(item => {
        subtotal += item.quantity * item.price;
        totalQuantity += item.quantity;
    });

    const taxRate = 0.04; // 4% tax rate
    const salesTax = subtotal * taxRate;
    let shipping = totalQuantity < 10 ? 2 : totalQuantity < 25 ? 5 : 10;
    const total = subtotal + salesTax + shipping;

    document.getElementById('subtotal-amount').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax-amount').textContent = `$${salesTax.toFixed(2)}`;
    document.getElementById('shipping-amount').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `$${total.toFixed(2)}`;
}



    // Initialize Bootstrap tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });


document.addEventListener('DOMContentLoaded', function() {
    // Your existing code to populate the invoice...
});

document.getElementById('confirm-purchase').addEventListener('click', function() {
    fetch('/confirm-purchase', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
        // No need to send body data if server uses session-based cart
    })
    .then(response => response.json())
    .then(data => {
// Display the thank-you message in the HTML div instead of an alert
const userName = document.getElementById('user-name').textContent; // Adjust if needed to get the user's name
const thankYouMessage = `Thank you ${userName}! for shopping with us, a copy of your invoice will be emailed to you.`;
const messageDiv = document.getElementById('thank-you-message');
messageDiv.textContent = thankYouMessage; // Set the text content of the div to your message
messageDiv.style.display = 'block'; // Make the div visible

        // Redirect to the home page after 5 seconds
        setTimeout(function() {
            window.location.href = '/index.html';
        }, 5000);
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle any errors here
    });
});

// Add event listener for the "Continue Shopping" button
document.getElementById('continue-shopping').addEventListener('click', function() {
    window.location.href = '/products_display.html' + window.location.search;
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

document.addEventListener('DOMContentLoaded', updateCartIcon);

document.addEventListener('DOMContentLoaded', function() {
    // Check login status and set username
    fetch('/check-login-status')
    .then(response => response.json())
    .then(data => {
        if (data.isLoggedIn) {
            // User is logged in, display the username in the navbar
            const userName = data.userName;
            document.getElementById('user-name').textContent = userName;
            // Make the dropdown clickable by adding 'dropdown-toggle' class
            const profileLink = document.getElementById('navbarDropdown');
            profileLink.classList.add('dropdown-toggle');
            profileLink.setAttribute('data-toggle', 'dropdown');

            // Also display the username and email in the footer
            document.getElementById('user-name-footer').textContent = userName;
            document.getElementById('user-email-footer').textContent = data.userEmail; // Use the email from the response
        } else {
            // User is not logged in, hide the dropdown toggle functionality
            const dropdownElement = document.getElementById('navbarDropdown');
            if (dropdownElement) {
                dropdownElement.remove();
            }
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
        headers: {
            'Content-Type': 'application/json'
        }
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
