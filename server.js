const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const path = require('path');
const session = require('express-session');
const nodemailer = require('nodemailer');

// Middleware for parsing application/x-www-form-urlencoded and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// Middleware to validate token
const validateToken = (req, res, next) => {
    const { token } = req.query;
    const users = getUserData();
    const user = users.find(user => user.token === token);

    if (!user) {
        res.status(403).send('Access Denied');
    } else {
        req.user = user; // Store user information for further use
        next();
    }
};


// Create a transporter object using Gmail SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'spammartmail@gmail.com',
      pass: 'sloj mqwh pnbe aohn'
    }
  });

app.use(session({
    secret: 'secret_key', // Replace with your actual secret key
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // Set to true if you are using HTTPS
        maxAge: 15 * 60 * 1000 // Set the session to expire after 15 minutes of inactivity
    },
    rolling: true // Reset the session expiration time on every request
}));

  app.post('/add-to-cart', (req, res) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }

    const { productId, quantity } = req.body;
    const productToAdd = products.find(product => product.id === productId);

    if (!productToAdd || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid product data or quantity' });
    }

    // Check if the product is already in the cart
    const existingProductIndex = req.session.cart.findIndex(item => item.id === productId);

    if (existingProductIndex > -1) {
        // Update quantity if product is already in cart
        req.session.cart[existingProductIndex].quantity += quantity;
    } else {
        // Add new item to cart
        const newCartItem = { 
            ...productToAdd,
            quantity: quantity 
        };
        req.session.cart.push(newCartItem);
    }

    const totalItems = req.session.cart.reduce((total, item) => total + item.quantity, 0);

    res.json({ message: 'Product added to cart', cart: req.session.cart, totalItems: totalItems });
});
app.post('/remove-from-cart', (req, res) => {
    // Convert productId from string to number
    const productId = parseInt(req.body.productId, 10);
    
    // Then use it to filter out the item from the cart
    req.session.cart = req.session.cart.filter(item => item.id !== productId);

    res.json({ success: true, cart: req.session.cart });
});


app.get('/get-cart', (req, res) => {
    // Ensure the cart exists and is an array before trying to map over it
    if (!Array.isArray(req.session.cart)) {
        req.session.cart = [];
    }
    const cartWithDetails = req.session.cart.map(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        return {
            ...cartItem,
            name: product ? product.name : 'Unknown Product',
            price: product ? product.price : 0,
            image: product ? product.image : 'no_image_available.png',
            description: product ? product.description : 'No description available'
        };
    });

    res.json(cartWithDetails);
});

app.post('/update-cart', (req, res) => {
    if (!req.session.cart) {
        return res.status(400).json({ error: 'No cart found' });
    }

    const updates = req.body.updates; // Expecting an array of { id, quantity }

    updates.forEach(update => {
        const itemIndex = req.session.cart.findIndex(item => item.id === update.id);
        if (itemIndex > -1) {
            if (update.quantity > 0) {
                req.session.cart[itemIndex].quantity = update.quantity;
            } else {
                // Remove item if quantity is 0 or less
                req.session.cart.splice(itemIndex, 1);
            }
        }
    });

    res.json({ success: true, cart: req.session.cart });
});

app.get('/checkout', (req, res) => {
    // Check if the cart exists and is not empty
    if (req.session.cart && req.session.cart.length > 0) {
        // Check if the user is logged in
        if (req.session.user) {
            // User is logged in, proceed with the checkout process
            // Redirect to the invoice page
            res.redirect('/invoice.html');
        } else {
            // User is not logged in, redirect to the login page with a message
            req.session.checkoutInProgress = true; // Mark that checkout was in progress
            res.redirect('/login.html?message=' + encodeURIComponent('Please log in to complete your purchase.'));
        }
    } else {
        // Cart is empty, redirect to the cart page with a message
        res.redirect('/cart.html?message=' + encodeURIComponent('Your cart is empty.'));
    }

// Protect the invoice route
app.get('/invoice.html', validateToken, (req, res) => {
    // Serve the invoice page
    res.sendFile(path.join(__dirname, '/public', 'invoice.html'));
});
});


// Log all requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});

// Import product data
const products = require(__dirname + "/products.json");

// Initialize quantity sold for each product
products.forEach(product => {
    product.qty_sold = 0;
});

// Serve product data
app.get('/products.js', function(request, response) {
    response.type('.js');
    const products_str = `let products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

// Function to get user data
const getUserData = () => {
    try {
        const jsonData = fs.readFileSync(__dirname + '/user_data.json', 'utf-8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error("Error reading from user_data.json:", error);
        return [];
    }
};

// Function to save user data
const saveUserData = (data) => {
    try {
        const stringifyData = JSON.stringify(data, null, 2);
        fs.writeFileSync(__dirname + '/user_data.json', stringifyData);
    } catch (error) {
        console.error("Error writing to user_data.json:", error);
    }
};


// Function to check if email is already in use
const isEmailInUse = (email) => {
    const users = getUserData();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
};

// Helper function to validate user credentials
function validateUser(email, password) {
    const users = getUserData();
    const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        return false;
    }
    
    // Create hash from the attempted password with the salt from the stored user
    const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`);
    return user.password === hash;
}

// Helper function to generate a secure token
function generateToken() {
    return crypto.randomBytes(16).toString('hex');
}

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (validateUser(email, password)) {
        const users = getUserData();
        const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());

        if (user) {
            // Generate and assign a new token, if you're using token-based authentication
            user.token = generateToken(); // This should be saved in a more persistent way if needed
            saveUserData(users); // Save any changes to user data

            // Set up user session
            req.session.user = {
                isLoggedIn: true,
                name: user.name,
                email: user.email,
                token: user.token // You may also set the token here if you're using it for session management
            };

            // Restore the user's cart from the saved data
            req.session.cart = user.cart || [];

            // Redirect to the invoice page if there are items in the cart, otherwise redirect to a welcome or home page
            if (req.session.cart && req.session.cart.length > 0) {
                res.redirect('/invoice.html'); // Replace with the actual path to your invoice page
            } else {
                res.redirect('/index.html'); // Replace with the actual path to your home page
            }
        } else {
            // If user credentials are invalid, redirect back to login page with an error message
            res.redirect(`/login.html?error=${encodeURIComponent('Invalid Email or Password. Please try again.')}&email=${encodeURIComponent(email)}`);
        }
    } else {
        // If user credentials are invalid, redirect back to login page with an error message
        res.redirect(`/login.html?error=${encodeURIComponent('Invalid Email or Password. Please try again.')}&email=${encodeURIComponent(email)}`);
    }
});



app.get('/check-login-status', (req, res) => {
    // Check if the user session exists and has a user object with isLoggedIn true
    if (req.session && req.session.user && req.session.user.isLoggedIn) {
        // Send back the logged-in status, the user's name, and email
        res.json({
            isLoggedIn: true,
            userName: req.session.user.name,
            userEmail: req.session.user.email // Include the user's email
        });
    } else {
        // If no user is logged in, send back a logged-out status
        res.json({
            isLoggedIn: false
        });
    }
});


app.post('/register', async (req, res) => {
    const { email, password, name, confirmPassword } = req.body;
    let errors = [];

    // Check for empty fields
    if (!name.trim()) {
        errors.push('*Name is required.');
    }
    if (!email.trim()) {
        errors.push('*Email is required.');
    }
    if (!password.trim()) {
        errors.push('*Password is required.');
    }
    if (!confirmPassword.trim()) {
        errors.push('*Please confirm password.');
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        errors.push('Passwords do not match.');
    }

    // Email validation (format and uniqueness)
    if (email.trim() && !/^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/.test(email)) {
        errors.push('*Invalid email format.');
    } else if (email.trim()) {
        const emailInUse = await isEmailInUse(email);
        if (emailInUse) {
            errors.push('*Email is already in use.');
        }
    }

    // Password validation
    if (password.trim()) {
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < 10 || password.length > 16) {
            errors.push('*Password must be 10-16 characters long.');
        } else if (!hasNumber) {
            errors.push('*Password must contain at least one number.');
        } else if (!hasSpecialChar) {
            errors.push('*Password must contain at least one special character.');
        } else if (password.includes(' ')) {
            errors.push('*Password cannot include spaces.');
        }
    }

    // Full name validation
    if (name.trim() && !/^[a-zA-Z\s]{2,30}$/.test(name)) {
        errors.push('*Name must only contain letters and be 2-30 characters long.');
    }

    if (errors.length > 0) {
        // Preserve the user input (excluding passwords) in session for sticky form behavior
        req.session.registrationData = { email, name };
        // Store errors in session
        req.session.registrationErrors = errors;
        res.redirect('/register.html');
        return;
    }

    if (errors.length === 0) {
        // Encrypt the password
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);

        // Generate a token for the new user
        const token = generateToken();

        // Create new user object with hashed password and token
        const newUser = { name, email, password: hash, salt, token };
        const users = getUserData();
        users.push(newUser);
        saveUserData(users);

        // Store user data in session
        req.session.user = {
            name: newUser.name,
            email: newUser.email,
            isLoggedIn: true,
            token: newUser.token
        };

        // Check for cart data in session
        if (req.session.cart && req.session.cart.length > 0) {
            // Redirect to registration_success.html
            res.redirect('/registration_success.html');
        } else {
            // Redirect to registration_success2.html
            res.redirect('/registration_success2.html');
        }
    }
});

app.get('/get-registration-errors-and-data', (req, res) => {
    res.json({
        errors: req.session.registrationErrors || [],
        stickyData: req.session.registrationData || {}
    });

    // Clear the errors and sticky data from the session after sending them
    delete req.session.registrationErrors;
    delete req.session.registrationData;
});

// Route for checking email uniqueness
app.get('/check-email', (req, res) => {
    const email = req.query.email;
    if (isEmailInUse(email)) {
        res.json({ isUnique: false });
    } else {
        res.json({ isUnique: true });
    }
});

app.post('/logout', (req, res) => {
    if (req.session && req.session.user) {
        const users = getUserData();
        const userIndex = users.findIndex(user => user.email === req.session.user.email);

        if (userIndex !== -1) {
            users[userIndex].cart = req.session.cart || []; // Save the cart to the user's record
            saveUserData(users);
        }

        // Clear user's session
        req.session.user = null;
        req.session.cart = [];
    }

    res.json({ success: true, message: 'Successfully logged out.' });
});

app.post('/confirm-purchase', async (req, res) => {
    if (!req.session || !req.session.user || !req.session.cart) {
        return res.status(403).send('Access Denied');
    }

    const cartItems = req.session.cart;
    const invoiceHtml = generateInvoiceHtml(cartItems);

    cartItems.forEach(item => {
        const productIndex = products.findIndex(p => p.id === item.id);
        if (productIndex !== -1) {
            products[productIndex].qty_available -= item.quantity;
            products[productIndex].qty_sold += item.quantity;
        }
    });

    // Prepare the email options
    const mailOptions = {
      from: 'spammartmail@gmail.com', // This should be the email associated with your Gmail account used for sending
      to: req.session.user.email, // The user's email from the session
      subject: '[Spam Mart] Order Confirmation',
      html: invoiceHtml // The generated HTML for the invoice
    };

    // Send an email to the user with the invoice
    try {
        await transporter.sendMail(mailOptions);
        // Clear the cart session after sending the email
        req.session.cart = [];
        res.json({ message: "Thank you for your purchase! An invoice has been emailed to you." });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send('There was an error processing your request.');
    }
});
// Server-side function to generate invoice HTML for email
function generateInvoiceHtml(cartItems) {
    let subtotal = 0;
    let totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Generate table rows for each cart item
    const rowsHtml = cartItems.map(item => {
        const totalItemPrice = item.quantity * item.price;
        subtotal += totalItemPrice;

        return `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${totalItemPrice.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    const taxRate = 0.04; // 4% tax rate
    const salesTax = subtotal * taxRate;
    let shipping = totalQuantity < 10 ? 2 : totalQuantity < 25 ? 5 : 10;
    const total = subtotal + salesTax + shipping;

    // Return the full HTML for the email
    return `
        <h1>Invoice from Spam Mart</h1>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Extended Price</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3">Subtotal</td>
                    <td>$${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td colspan="3">Sales Tax (4%)</td>
                    <td>$${salesTax.toFixed(2)}</td>
                </tr>
                <tr>
                    <td colspan="3">Shipping</td>
                    <td>$${shipping.toFixed(2)}</td>
                </tr>
                <tr>
                    <td colspan="3"><strong>Total Amount</strong></td>
                    <td><strong>$${total.toFixed(2)}</strong></td>
                </tr>
            </tfoot>
        </table>
    `;
}

// Serve static files from 'public' directory
app.use(express.static(__dirname + '/public'));

// Start the server
app.listen(8080, () => console.log(`listening on port 8080`));
