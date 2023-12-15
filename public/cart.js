// This function should be called when the cart page loads
function displayCartPage() {
    fetch('/get-cart')
        .then(response => response.json())
        .then(cart => {
            if (cart.length === 0) {
                displayEmptyCart();
            } else {
                displayCartItems(cart);
                updateCartTotals(cart);
            }
        })
        .catch(error => console.error('Error:', error));
}

function displayEmptyCart() {
    const cartContainer = document.getElementById('cart-items-container');
    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
    // Optionally hide or remove the cart totals section
    const cartTotalsContainer = document.querySelector('.cart-totals');
    if (cartTotalsContainer) cartTotalsContainer.style.display = 'none';
}

// Function to display cart items on the cart page
function displayCartItems(cart) {
    const cartContainer = document.getElementById('cart-items-container');
    cartContainer.innerHTML = ''; // Clear existing items

    cart.forEach(item => {
        const itemElement = createCartItemElement(item);
        cartContainer.appendChild(itemElement);
    });
}

function createCartItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item row';
    // Removed the inline 'onclick' handler to prevent duplicate event binding
    itemDiv.innerHTML = `
        <div class="col-md-4">
            <img src="${item.image}" alt="${item.name}" class="img-fluid">
        </div>
        <div class="col-md-8">
            <h5>${item.name}</h5>
            <p>Price: $${item.price.toFixed(2)}</p>
            <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="item-quantity">
            <button class="remove-item-btn">Remove</button>
            <p>Total: $${(item.price * item.quantity).toFixed(2)}</p>
        </div>
    `;
    // Add event listener here
    const removeButton = itemDiv.querySelector('.remove-item-btn');
    removeButton.addEventListener('click', () => removeItemFromCart(item.id));

    return itemDiv;
}

function updateCartTotals(cart) {
    let subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    let totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    const shippingCost = totalQuantity < 10 ? 2 : totalQuantity < 25 ? 5 : 10;
    const salesTax = subtotal * 0.04;
    const total = subtotal + salesTax + shippingCost;

    const cartTotalsContainer = document.getElementById('cart-totals-container');
    if (cartTotalsContainer) {
        cartTotalsContainer.innerHTML = `
            <div class="col-12 text-center">
                <h4>Cart Total</h4>
                <p>Subtotal: $${subtotal.toFixed(2)}</p>
                <p>Tax: $${salesTax.toFixed(2)}</p>
                <p>Shipping: $${shippingCost.toFixed(2)}</p>
                <p>Total: $${total.toFixed(2)}</p>
            </div>
        `;
    } else {
        console.error('Cart totals container not found'); // Debugging line
    }
}


function removeItemFromCart(productId) {
    fetch('/remove-from-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: productId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update the cart display without reloading the page
                if (data.cart.length === 0) {
                    displayEmptyCart();
                } else {
                    displayCartItems(data.cart);
                    updateCartTotals(data.cart);
                }
                updateCartIcon(data.cart);
            }
        })
        .catch(error => console.error('Error:', error));
}

function displayEmptyCart() {
    const cartContainer = document.getElementById('cart-items-container');
    cartContainer.innerHTML = ''; // Clear any previous content

    const emptyCartMessage = document.createElement('div');
    emptyCartMessage.className = 'empty-cart-message'; // Add the class here
    emptyCartMessage.innerText = 'Cart is Empty';

    cartContainer.appendChild(emptyCartMessage);

    // Hide the cart totals container
    const cartTotalsContainer = document.getElementById('cart-totals-container');
    if (cartTotalsContainer) cartTotalsContainer.style.display = 'none';
}

function gatherUpdates() {
    // Select all quantity input fields in the cart
    const quantityInputs = document.querySelectorAll('.item-quantity');
    const updates = Array.from(quantityInputs).map(input => {
        // Assuming 'data-id' attribute contains the product ID
        const id = parseInt(input.dataset.id, 10);
        const quantity = parseInt(input.value, 10);
        return { id, quantity };
    });

    // Filter out any items where quantity is not a number or less than 1
    return updates.filter(update => !isNaN(update.quantity) && update.quantity > 0);
}

function updateCart() {
    const updates = gatherUpdates();

    fetch('/update-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates: updates })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error updating cart:', data.error);
            // Handle the error, optionally display a message to the user
        } else {
            // Handle successful cart update
            console.log('Cart updated successfully');
            // Reload the page to reflect the changes
            location.reload();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle the error, optionally display a message to the user
    });
}

function checkout() {
    // This function will be called when the "Checkout" button is clicked.
    window.location.href = '/checkout'; // Navigate to the checkout route on the server.
}

// Call displayCartPage when the page loads
document.addEventListener('DOMContentLoaded', function() {
    displayCartPage();
    updateCartIcon();
    
    // Attach event listener to the update cart button
    document.getElementById('update-cart').addEventListener('click', updateCart);

    // Attach event listener to the checkout button
    const checkoutButton = document.getElementById('checkout');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', checkout);
    }
});


// Add event listener to the update cart button
document.getElementById('update-cart').addEventListener('click', updateCart);



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


// Call displayCartPage when the page loads
document.addEventListener('DOMContentLoaded', displayCartPage);
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

