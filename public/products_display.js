// Get the container element from the DOM where products will be displayed
const productsContainer = document.getElementById('products-container');
let row = createRow();
productsContainer.appendChild(row);

// Loop through products and create cards, but only for products with IDs from 1 to 6
products.forEach((product) => {
    if (product.id >= 1 && product.id <= 6) {
        const card = createCard(product);
        row.appendChild(card);

        // Creating a new row after every third card
        if (product.id % 3 === 0 && product.id < 6) {
            row = createRow();
            productsContainer.appendChild(row);
        }
    }
});

// Define the createRow function that creates and returns a new row element
function createRow() {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row mb-4';
    return rowDiv;
}

function createCard(product) {
    // Create a new div element for the column layout
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4';

    // Create a new div element for the card
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';

    // Create an image element for the product and set its attributes
    const img = document.createElement('img');
    img.className = 'card-img-top';
    img.src = product.image; // Set the image source to the product's image
    img.alt = product.name; // Set the alt text to the product's name
    cardDiv.appendChild(img); // Append the image to the card

    // Create a div for the card body
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    // Create and append the title to the card body
    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = product.name;
    cardBody.appendChild(title);

    // Create and append the price to the card body
    const price = document.createElement('p');
    price.className = 'card-text';
    price.textContent = `Price: $${product.price}`;
    cardBody.appendChild(price);

    // Create and append the quantity available to the card body
    const qty = document.createElement('p');
    qty.className = 'card-text';
    qty.textContent = `Quantity Available: ${product.qty_available}`;
    cardBody.appendChild(qty);

    // Create a div for the purchase section with layout settings
    const purchaseDiv = document.createElement('div');
    purchaseDiv.className = 'purchase-section d-flex flex-column align-items-start justify-content-between mt-2';

    // Create a div for the quantity selector
    const quantitySelectorDiv = document.createElement('div');
    quantitySelectorDiv.className = 'quantity-selector d-flex align-items-center';

    // Create the decrement button
    const decrementButton = document.createElement('button');
    decrementButton.textContent = '-';
    decrementButton.className = 'quantity-change-button btn btn-outline-secondary';
    decrementButton.onclick = () => {
        adjustQuantity(quantityInput, product, -1);
    };

    // Create the increment button
    const incrementButton = document.createElement('button');
    incrementButton.textContent = '+';
    incrementButton.className = 'quantity-change-button btn btn-outline-secondary';
    incrementButton.onclick = () => {
        adjustQuantity(quantityInput, product, 1);
    };

    // Create and configure a number input for quantity
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.name = 'quantity_' + product.name.replace(/\s+/g, '_');
    quantityInput.className = 'form-control quantity-input';
    quantityInput.value = 0; // Start with a default value of 0
    quantityInput.min = 0; // The minimum value is 0
    quantityInput.max = product.qty_available; // The maximum value is the available quantity

    // Append the buttons and input to the selector div
    quantitySelectorDiv.appendChild(decrementButton);
    quantitySelectorDiv.appendChild(quantityInput);
    quantitySelectorDiv.appendChild(incrementButton);

    // Create the "Add to Cart" button
    const addToCartButton = document.createElement('button');
    addToCartButton.textContent = 'Add to Cart';
    addToCartButton.className = 'add-to-cart-button btn btn-primary mt-2';
    addToCartButton.onclick = () => {
        // Add functionality for adding the product to the cart here
        const productToAdd = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: parseInt(quantityInput.value, 10)
        };
    
        fetch('/add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productToAdd)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Product added', data);
            // Here you would update the UI to reflect the item being added to the cart
            updateCartDropdown(data.cart);
        })
        .catch(error => console.error('Error:', error));
    };

    // Append elements to the purchase section and card body
    purchaseDiv.appendChild(quantitySelectorDiv);
    purchaseDiv.appendChild(addToCartButton);
    cardBody.appendChild(purchaseDiv);

    // Construct the final product card by appending elements
    cardDiv.appendChild(cardBody);
    colDiv.appendChild(cardDiv);

    // Return the column div, which contains the complete card
    return colDiv;
}

// Function to adjust the quantity in the input field
function adjustQuantity(inputElement, product, change) {
    let currentVal = parseInt(inputElement.value, 10);
    currentVal += change;
    currentVal = Math.max(0, Math.min(currentVal, product.qty_available)); // Ensuring the value is within valid range
    inputElement.value = currentVal;
}


