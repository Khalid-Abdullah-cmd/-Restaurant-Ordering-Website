function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  const footer = document.getElementById("cart-footer");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML =
      '<p class="empty-cart-msg">العربة فارغة. <a href="index.html">تصفح القائمة</a></p>';
    footer.style.display = "none";
    updateCartCount();
    return;
  }

  footer.style.display = "block";

  cart.forEach(function (cartItem) {
    const item = menuItems.find(function (m) {
      return m.id === cartItem.id;
    });
    if (!item) {
      return;
    }

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item-info">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
      </div>
      <div class="quantity-controls">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty">${cartItem.quantity}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
      <div class="cart-item-total">${formatPrice(item.price * cartItem.quantity)}</div>
      <button class="remove-btn" onclick="removeItem(${item.id})">حذف</button>
    `;
    container.appendChild(row);
  });

  document.getElementById("cart-total").textContent = formatPrice(getCartTotal());
  updateCartCount();
}

function changeQty(itemId, change) {
  changeQuantity(itemId, change);
  renderCart();
}

function removeItem(itemId) {
  removeFromCart(itemId);
  renderCart();
}

renderCart();