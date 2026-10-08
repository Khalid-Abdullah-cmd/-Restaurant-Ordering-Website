

'use strict';

/* ==========================================================================
   1. CONFIG & STATE
   ========================================================================== */
const CART_KEY = 'restaurant_cart';
const MAX_QTY = 99;

let cart = loadCart();

/* ==========================================================================
   2. HELPERS
   ========================================================================== */

/** Read the cart from localStorage; never crash on bad or missing data. */
function loadCart() {
    try {
        const raw = JSON.parse(localStorage.getItem(CART_KEY));
        if (!Array.isArray(raw)) return [];
        // Keep only well-formed items
        return raw
            .filter(item => item && item.id && Number.isFinite(item.price) && item.quantity > 0)
            .map(item => ({
                id: String(item.id),
                name: String(item.name),
                price: Number(item.price),
                quantity: Math.min(Math.floor(item.quantity), MAX_QTY),
            }));
    } catch (err) {
        return [];
    }
}

function persistCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (err) {
        // Storage can be full or blocked (private mode). Cart still works until reload.
        console.warn('Could not save cart:', err);
    }
}

function clearCart() {
    cart = [];
    try {
        localStorage.removeItem(CART_KEY);
    } catch (err) {
        /* ignore */
    }
}

/** Escape text before putting it into innerHTML (meal names come from the database). */
function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
}

function formatMoney(amount) {
    return amount.toFixed(2);
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

/* ==========================================================================
   3. CART LOGIC
   ========================================================================== */

function addToCart({ id, name, price }) {
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity = Math.min(existing.quantity + 1, MAX_QTY);
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    saveAndRender();
    showToast(`${name} added to cart`);
}

function changeQuantity(id, delta) {
    const item = cart.find(entry => entry.id === id);
    if (!item) return;

    item.quantity = Math.min(item.quantity + delta, MAX_QTY);

    // Dropping to zero removes the item
    if (item.quantity <= 0) {
        cart = cart.filter(entry => entry.id !== id);
    }
    saveAndRender();
}

function removeFromCart(id) {
    cart = cart.filter(entry => entry.id !== id);
    saveAndRender();
}

function saveAndRender() {
    persistCart();
    renderAll();
}

/* ==========================================================================
   4. RENDERING
   ========================================================================== */

function renderAll() {
    renderCartBadge();
    renderCartPage();
    renderCheckoutPage();
}

/** Navbar badge. Create it once if the template doesn't already have one. */
function renderCartBadge() {
    let badge = document.getElementById('cart-count');

    if (!badge) {
        const cartLink = document.querySelector('.nav-links a[href$="cart/"], .nav-links a[href*="cart"]');
        if (!cartLink) return;
        badge = document.createElement('span');
        badge.id = 'cart-count';
        badge.className = 'cart-badge';
        cartLink.appendChild(badge);
    }

    const count = getCartCount();
    badge.textContent = count;
    badge.hidden = count === 0;
}

function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    const totalEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const isEmpty = cart.length === 0;

    if (isEmpty) {
        container.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${escapeHtml(item.id)}">
                <div class="cart-item-details">
                    <span class="cart-item-name">${escapeHtml(item.name)}</span>
                    <span class="cart-item-meta">$${formatMoney(item.price)} each</span>
                </div>
                <div class="cart-qty-controls">
                    <button type="button" class="qty-btn decrease" data-action="decrease" aria-label="Decrease quantity of ${escapeHtml(item.name)}">&minus;</button>
                    <span class="cart-qty" aria-live="polite">${item.quantity}</span>
                    <button type="button" class="qty-btn increase" data-action="increase" aria-label="Increase quantity of ${escapeHtml(item.name)}">+</button>
                </div>
                <span class="cart-line-total">$${formatMoney(item.price * item.quantity)}</span>
                <button type="button" class="remove" data-action="remove" aria-label="Remove ${escapeHtml(item.name)} from cart">Remove</button>
            </div>
        `).join('');
    }

    if (totalEl) totalEl.textContent = formatMoney(getCartTotal());

    if (checkoutBtn) {
        checkoutBtn.classList.toggle('is-disabled', isEmpty);
        checkoutBtn.setAttribute('aria-disabled', String(isEmpty));
        checkoutBtn.tabIndex = isEmpty ? -1 : 0;
    }
}

function renderCheckoutPage() {
    const container = document.getElementById('checkout-summary-container');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Your cart is empty. <a href="/menu/">Browse the menu</a></p>';
    } else {
        container.innerHTML = cart.map(item => `
            <div class="summary-row">
                <span>${escapeHtml(item.name)} <strong>(x${item.quantity})</strong></span>
                <span>$${formatMoney(item.price * item.quantity)}</span>
            </div>
        `).join('');
    }

    const totalEl = document.getElementById('checkout-total-price');
    if (totalEl) totalEl.textContent = formatMoney(getCartTotal());
}

/* ==========================================================================
   5. MENU SEARCH & CATEGORY FILTER
   Needs on each card:   data-search="{{ meal.name|lower }} {{ meal.description|lower }}"
                         data-category="{{ meal.category }}"
   Needs on the page:    <input id="menu-search">
                         category links with data-category="all" | "<value>"
                         <p id="no-results" hidden>...</p>
   ========================================================================== */

function initMenuFilter() {
    const searchInput = document.getElementById('menu-search');
    const cards = document.querySelectorAll('.meals .meal[data-search]');
    if (!searchInput || cards.length === 0) return;

    const chips = document.querySelectorAll('.categories [data-category]');
    const emptyMessage = document.getElementById('no-results');
    const params = new URLSearchParams(window.location.search);

    let activeCategory = params.get('category') || 'all';
    if (!searchInput.value && params.get('q')) searchInput.value = params.get('q');

    function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        cards.forEach(card => {
            const matchesSearch = card.dataset.search.includes(query);
            const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
            const show = matchesSearch && matchesCategory;

            card.hidden = !show;
            if (show) visibleCount++;
        });

        if (emptyMessage) emptyMessage.hidden = visibleCount !== 0;
    }

    function setActiveChip() {
        chips.forEach(chip => {
            chip.classList.toggle('active', chip.dataset.category === activeCategory);
        });
    }

    chips.forEach(chip => {
        chip.addEventListener('click', event => {
            event.preventDefault(); // stay on the page, filter instantly
            activeCategory = chip.dataset.category;
            setActiveChip();
            applyFilters();
        });
    });

    // The search form still works without JS; with JS we filter as you type
    const searchForm = searchInput.closest('form');
    if (searchForm) searchForm.addEventListener('submit', event => event.preventDefault());

    searchInput.addEventListener('input', applyFilters);

    setActiveChip();
    applyFilters();
}

/* ==========================================================================
   6. CHECKOUT FORM
   ========================================================================== */

function initCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', event => {
        if (cart.length === 0) {
            event.preventDefault();
            showToast('Your cart is empty. Add some meals first.', 'error');
            return;
        }

        // Send only id + quantity; the server must look up prices itself
        const payload = cart.map(({ id, quantity }) => ({ id, quantity }));
        document.getElementById('cart_data').value = JSON.stringify(payload);

        // Prevent double-clicks creating duplicate orders
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Placing order...';
        }
    });
}

/* ==========================================================================
   7. TOAST NOTIFICATIONS  (styles live in style.css under .toast)
   ========================================================================== */

function showToast(message, type = 'success') {
    let region = document.getElementById('toast-region');
    if (!region) {
        region = document.createElement('div');
        region.id = 'toast-region';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        document.body.appendChild(region);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    region.appendChild(toast);

    // Next frame so the CSS transition runs
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        setTimeout(() => toast.remove(), 600); // fallback if no transition fires
    }, 2500);
}

/* ==========================================================================
   8. INIT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Success page: the order is saved, so empty the cart.
    // Add id="order-success" to the main box in success.html.
    if (document.getElementById('order-success') || window.location.pathname.includes('/success')) {
        clearCart();
    }

    // Add-to-cart buttons (event delegation: also works for buttons added later)
    document.addEventListener('click', event => {
        const addBtn = event.target.closest('.add-to-cart');
        if (addBtn) {
            const price = parseFloat(addBtn.dataset.price);
            if (!Number.isFinite(price)) {
                console.error('Invalid data-price on add-to-cart button:', addBtn.dataset.price);
                return;
            }
            addToCart({ id: String(addBtn.dataset.id), name: addBtn.dataset.name, price });
            return;
        }

        // Quantity / remove buttons inside the cart list
        const actionBtn = event.target.closest('[data-action]');
        const row = actionBtn && actionBtn.closest('.cart-item');
        if (!actionBtn || !row) return;

        const id = row.dataset.id;
        switch (actionBtn.dataset.action) {
            case 'increase': changeQuantity(id, 1); break;
            case 'decrease': changeQuantity(id, -1); break;
            case 'remove':   removeFromCart(id); break;
        }
    });

    // Block the disabled "Proceed to Checkout" link (works for keyboard too)
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', event => {
            if (cart.length === 0) {
                event.preventDefault();
                showToast('Add something to your cart first.', 'error');
            }
        });
    }

    // Keep multiple tabs in sync
    window.addEventListener('storage', event => {
        if (event.key === CART_KEY) {
            cart = loadCart();
            renderAll();
        }
    });

    initMenuFilter();
    initCheckoutForm();
    renderAll();
});