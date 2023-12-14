// Call this function when the cart page loads
function displayCartPage() {
    fetch('/get-cart')
    .then(response => response.json())
    .then(cart => {
        displayCartItems(cart);
    })
    .catch(error => console.error('Error:', error));
}