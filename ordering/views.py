import json
from decimal import Decimal
from django.db import transaction
from django.shortcuts import redirect, render
from .forms import CheckoutForm
from .models import MenuItem, Order, OrderItem

MAX_QTY_PER_ITEM = 50


def _parse_cart(raw):
    """
    Utility helper to turn the raw client JSON string into {menu_item_id: quantity}.
    """
    try:
        data = json.loads(raw or "[]")
    except (TypeError, ValueError):
        return {}

    if not isinstance(data, list):
        return {}

    cart = {}
    for entry in data:
        if not isinstance(entry, dict):
            continue
        try:
            item_id = int(entry.get("id"))
            quantity = int(entry.get("quantity", 1))
        except (TypeError, ValueError):
            continue
        if quantity > 0:
            cart[item_id] = min(cart.get(item_id, 0) + quantity, MAX_QTY_PER_ITEM)
    return cart


def _build_order_lines(cart):
    """
    Utility helper to look up cart items in one query and secure database prices.
    """
    menu_items = MenuItem.objects.in_bulk(cart.keys())
    lines = [(menu_items[i], q) for i, q in cart.items() if i in menu_items]
    total = sum((item.price * q for item, q in lines), Decimal("0.00"))
    return lines, total


def home_view(request):
    # Retrieve a subset of MenuItem objects from the database to feature as "popular meals"
    # Retrieve the available food categories to populate the category selection area
    # Pass the popular meals and category data to the home.html template for rendering
    pass




def menu_view(request):
    # Retrieve all MenuItem objects from the database
    # Extract search parameters from the request to handle search bar queries
    # Extract category parameters from the request to filter the meals by category
    # Pass the dynamically filtered queryset of meals to the menu.html template
    pass


def detail_view(request, item_id):
    # Accept the item_id parameter from the dynamic URL routing
    # Query the database for the specific MenuItem matching that ID
    # Pass the single MenuItem object to the detail.html template to display its full name, description, price, image, and rating
    pass


def cart_view(request):
    # Render the cart.html template layout
    # Provide the necessary HTML structure (empty containers or data attributes) so the frontend JavaScript can dynamically render the cart items, control quantities, and calculate the total
    return render(request, "cart.html")


def checkout_view(request):
    if request.method != "POST":
        return render(request, "checkout.html", {"form": CheckoutForm()})

    
    form = CheckoutForm(request.POST)
    cart = _parse_cart(request.POST.get("cart_data"))
    lines, total_price = _build_order_lines(cart)

   
    cart_error = None
    if not lines:
        cart_error = "Your cart is empty. Add items from the menu before checking out."

    if cart_error or not form.is_valid():
        return render(request, "checkout.html", {"form": form, "cart_error": cart_error})

    
    with transaction.atomic():
        order = form.save(commit=False)
        order.total_price = total_price
        order.save()
        
        OrderItem.objects.bulk_create([
            OrderItem(order=order, menu_item=item, quantity=quantity, price=item.price)
            for item, quantity in lines
        ])

    
    request.session["customer_name"] = order.customer_name
    request.session["order_id"] = order.pk

    
    return redirect("success")


def success_view(request):
    
    customer_name = request.session.get("customer_name")
    order_id = request.session.get("order_id")

   
    if not customer_name:
        return redirect("menu")

   
    return render(request, "success.html", {
        "customer_name": customer_name,
        "order_id": order_id,
    })
