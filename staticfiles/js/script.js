// 1. Initialize the cart from localStorage, or create an empty array if it doesn't exist
let cart = JSON.parse(localStorage.getItem('restaurant_cart')) || [];

// Run this code once the HTML is fully loaded on the screen
document.addEventListener("DOMContentLoaded", () => {
    
    // 2. Attach click events to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get data attributes from the clicked button
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            
            // Check if item is already in cart
            const existingItem = cart.find(item => item.id === id);
            
            if (existingItem) {
                existingItem.quantity += 1; // Increase quantity
            } else {
                // Add new item
                cart.push({ id: id, name: name, price: price, quantity: 1 });
            }
            
            saveCart();
            showToast(`${name} added to cart! 🍔`);
        });
    });

    // 3. Render Cart & Checkout pages if the user is on them
    renderCartPage();
    renderCheckoutPage();
    
    // 4. Intercept the checkout form to inject the cart data
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            if (cart.length === 0) {
                e.preventDefault(); // Stop form from submitting
                alert("Your cart is empty! Please add some meals before checking out.");
                return;
            }
            // Put the cart array into the hidden input field for Django to read
            document.getElementById('cart_data').value = JSON.stringify(cart);
        });
    }

    // 5. Clear the cart automatically if the user reaches the success page
    if (window.location.pathname.includes('/success/')) {
        localStorage.removeItem('restaurant_cart');
        cart = [];
    }
});

// --- Core Cart Functions ---

function saveCart() {
    // Save to browser storage so data survives page refreshes
    localStorage.setItem('restaurant_cart', JSON.stringify(cart));
    // Immediately update the UI if we are on the cart or checkout page
    renderCartPage();
    renderCheckoutPage();
}

// Make these functions globally accessible for the inline onclick attributes in the HTML
window.updateQty = function(index, change) {
    cart[index].quantity += change;
    // If quantity goes to 0 or below, remove the item entirely
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
};

window.removeItem = function(index) {
    cart.splice(index, 1); // Remove 1 item at the specific index
    saveCart();
};

// --- Page Renderers ---

function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    if (!container) return; // Stop if we aren't on the cart page

    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666; font-size: 1.2rem;">Your cart is empty.</p>';
        document.getElementById('checkout-btn').style.pointerEvents = 'none';
        document.getElementById('checkout-btn').style.opacity = '0.5';
    } else {
        document.getElementById('checkout-btn').style.pointerEvents = 'auto';
        document.getElementById('checkout-btn').style.opacity = '1';
        
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            container.innerHTML += `
                <div class="cart-list-item">
                    <div class="cart-item-details">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-meta">$${item.price.toFixed(2)} each</span>
                    </div>
                    <div class="cart-qty-controls">
                        <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                        <span style="font-weight: bold; width: 20px; text-align: center;">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                        <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8rem; margin-left: 15px;" onclick="removeItem(${index})">Remove</button>
                    </div>
                </div>
            `;
        });
    }
    // Update total price automatically
    document.getElementById('cart-total-price').innerText = total.toFixed(2);
}

function renderCheckoutPage() {
    const container = document.getElementById('checkout-summary-container');
    if (!container) return; // Stop if we aren't on the checkout page

    container.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        container.innerHTML += `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <span>${item.name} <strong>(x${item.quantity})</strong></span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    });
    document.getElementById('checkout-total-price').innerText = total.toFixed(2);
}

// --- UI Enhancements ---

function showToast(message) {
    // Create a temporary notification banner
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background-color: var(--primary);
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        font-weight: bold;
        transition: opacity 0.5s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Make it disappear after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}