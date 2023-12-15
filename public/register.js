document.addEventListener('DOMContentLoaded', function() {
    // Fetch errors and sticky data from the server
    fetch('/get-registration-errors-and-data')
    .then(response => response.json())
    .then(data => {
        displayServerSideErrors(data.errors);
        populateStickyInputs(data.stickyData);
    })
    .catch(error => console.error('Error:', error));

    // Function to display server-side validation errors
    function displayServerSideErrors(errors) {
        if (!errors) return;

        // Clear previous errors
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(function(element) {
            element.textContent = ''; // Clear any previous text content
        });

        // Display new errors
        errors.forEach(error => {
            if (error.toLowerCase().includes('email')) {
                showError('email', error);
            } else if (error.toLowerCase().includes('password') && !error.toLowerCase().includes('confirm password')) {
                showError('password', error);
            } else if (error.toLowerCase().includes('confirm password')) {
                showError('confirm-password', error); // Adjust ID if necessary
            } else if (error.toLowerCase().includes('name')) {
                showError('name', error);
            }
        });
    }

    // Function to show error messages
    function showError(inputId, message) {
        const errorDiv = document.getElementById('error-' + inputId);
        if (errorDiv) {
            errorDiv.textContent = message;
        }
    }

    // Function to populate input fields with sticky data
    function populateStickyInputs(stickyData) {
        if (!stickyData) return;

        const { name, email } = stickyData;

        // Set name if available
        if (name) {
            const nameInput = document.getElementById('name');
            if (nameInput) {
                nameInput.value = name;
            }
        }

        // Set email if available
        if (email) {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.value = email;
            }
        }
    }

    // Password show/hide toggles
    document.getElementById('show-password').addEventListener('change', function() {
        const passwordInput = document.getElementById('password');
        passwordInput.type = this.checked ? 'text' : 'password';
    });
    
    document.getElementById('show-confirm-password').addEventListener('change', function() {
        const confirmPasswordInput = document.getElementById('confirm-password');
        confirmPasswordInput.type = this.checked ? 'text' : 'password';
    });
});

   // Check if the user is already logged in
   checkLoginStatus();

   // Function to check login status
   function checkLoginStatus() {
       fetch('/check-login-status')
       .then(response => response.json())
       .then(data => {
           if (data.isLoggedIn) {
               disableInputsAndShowMessage();
           }
       })
       .catch(error => console.error('Error:', error));
   }

   // Function to disable all inputs and show a message
   function disableInputsAndShowMessage() {
       const inputs = document.querySelectorAll('input');
       inputs.forEach(input => {
           input.disabled = true; // Disable all input fields
       });

       // Display a message to the user
       const messageContainer = document.createElement('div');
       messageContainer.classList.add('logged-in-message');
       messageContainer.textContent = 'You are already logged in. You cannot register while logged in.';
       document.body.insertBefore(messageContainer, document.body.firstChild);
   }


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


