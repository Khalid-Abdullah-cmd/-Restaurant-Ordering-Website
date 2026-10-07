const CART_KEY = "restaurantCart";

function getCart() {
  const savedCart = localStorage.getItem(CART_KEY);
  if (savedCart === null) {
    return [];
  }
  return JSON.parse(savedCart);
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(itemId) {
  const cart = getCart();
  const existing = cart.find(function (c) {
    return c.id === itemId;
  });

  if (existing) {
    existing.quantity = existing.quantity + 1;
  } else {
    cart.push({ id: itemId, quantity: 1 });
  }
  saveCart(cart);
}

function removeFromCart(itemId) {
  const cart = getCart().filter(function (c) {
    return c.id !== itemId;
  });
  saveCart(cart);
}

function changeQuantity(itemId, change) {
  const cart = getCart();
  const existing = cart.find(function (c) {
    return c.id === itemId;
  });

  if (existing) {
    existing.quantity = existing.quantity + change;
    if (existing.quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
  }
  saveCart(cart);
}

function getCartCount() {
  let count = 0;
  getCart().forEach(function (c) {
    count = count + c.quantity;
  });
  return count;
}

function getCartTotal() {
  let total = 0;
  getCart().forEach(function (c) {
    const item = menuItems.find(function (m) {
      return m.id === c.id;
    });
    if (item) {
      total = total + item.price * c.quantity;
    }
  });
  return total;
}

function formatPrice(number) {
  return number.toFixed(2) + " $";
}

function updateCartCount() {
  const badge = document.getElementById("cart-count");
  if (badge) {
    badge.textContent = getCartCount();
  }
}