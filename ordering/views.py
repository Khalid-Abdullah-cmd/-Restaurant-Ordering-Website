import json
from decimal import Decimal
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
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
    """Show the landing page with highly rated meals and menu categories."""
    popular_meals = MenuItem.objects.order_by("-rating", "name")[:6]
    categories = MenuItem.Category.choices
    return render(
        request,
        "home.html",
        {"popular_meals": popular_meals, "categories": categories},
    )




def menu_view(request):
    """List meals, with optional search and category filters."""
    meals = MenuItem.objects.all()
    query = request.GET.get("q", "").strip()
    selected_category = request.GET.get("category", "").strip()

    if query:
        meals = meals.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )

    valid_categories = dict(MenuItem.Category.choices)
    if selected_category in valid_categories:
        meals = meals.filter(category=selected_category)
    else:
        selected_category = ""

    return render(
        request,
        "menu.html",
        {
            "meals": meals,
            "categories": MenuItem.Category.choices,
            "query": query,
            "selected_category": selected_category,
        },
    )


def detail_view(request, item_id):
    """Show one menu item's details."""
    meal = get_object_or_404(MenuItem, pk=item_id)
    return render(request, "detail.html", {"meal": meal})


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
