function updateCartDropdown() {
    const cartDropdown = document.getElementById('cart-dropdown-content');
    cartDropdown.innerHTML = ''; // Clear current content
    // Assuming 'cart' is your array of cart items
    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'dropdown-item';
        cartItemDiv.textContent = `${item.name} - Quantity: ${item.quantity}`;
        cartDropdown.appendChild(cartItemDiv);
    });
}