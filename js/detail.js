const params = new URLSearchParams(window.location.search);

const itemId = Number(params.get("id"));

const item = menuItems.find(function (m) {
    return m.id === itemId;
});

if (item) {
    document.title = item.name;

    document.getElementById("item-image").src = item.image;
    document.getElementById("item-image").alt = item.name;
    document.getElementById("item-category").textContent = item.category;
    document.getElementById("item-name").textContent = item.name;
    document.getElementById("item-rating").textContent = item.rating;
    document.getElementById("item-description").textContent = item.description;
    document.getElementById("item-price").textContent = formatPrice(item.price);

    document.getElementById("add-to-cart-btn").addEventListener("click", function () {
        addToCart(item.id);
        updateCartCount();

        document.getElementById("add-message").textContent =
            "تمت إضافة " + item.name + " إلى العربة ✔";
    });
} else {
    document.getElementById("detail-card").style.display = "none";
    document.getElementById("not-found").style.display = "block";
}

updateCartCount();