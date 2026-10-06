# Create your tests here.
import json
from decimal import Decimal

from django.test import TestCase, override_settings
from django.urls import reverse

from .models import MenuItem, Order, OrderItem



STUB_TEMPLATES = override_settings(TEMPLATES=[{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "OPTIONS": {
        "loaders": [("django.template.loaders.locmem.Loader", {
            "cart.html": "cart page",
            "checkout.html": "{{ form.as_p }}{{ cart_error }}",
            "success.html": "{{ customer_name }} {{ order_id }}",
        })],
        "context_processors": ["django.template.context_processors.request"],
    },
}])


def cart_json(*pairs):
    """Build the cart_data string the frontend JavaScript sends: [{"id":1,"quantity":2}]"""
    return json.dumps([{"id": i, "quantity": q} for i, q in pairs])


@STUB_TEMPLATES
class CartViewTests(TestCase):
    def test_cart_page_renders(self):
        response = self.client.get(reverse("cart"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "cart.html")


@STUB_TEMPLATES
class CheckoutViewTests(TestCase):
    def setUp(self):
        self.burger = MenuItem.objects.create(
            name="Burger", price=Decimal("8.50"), category=MenuItem.Category.BURGER
        )
        self.pizza = MenuItem.objects.create(
            name="Pizza", price=Decimal("10.00"), category=MenuItem.Category.PIZZA
        )
        self.details = {
            "customer_name": "Khalid",
            "phone": "01001234567",
            "address": "12 Pyramids Rd, Giza",
        }

    def place_order(self, cart, **overrides):
        return self.client.post(
            reverse("checkout"), {**self.details, **overrides, "cart_data": cart}
        )

    def test_get_shows_empty_form(self):
        response = self.client.get(reverse("checkout"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "checkout.html")
        self.assertFalse(response.context["form"].is_bound)

    def test_valid_order_is_saved_and_redirects_to_success(self):
        response = self.place_order(cart_json((self.burger.pk, 2), (self.pizza.pk, 1)))
        self.assertRedirects(response, reverse("success"))

        order = Order.objects.get()
        self.assertEqual(order.customer_name, "Khalid")
        self.assertEqual(order.total_price, Decimal("27.00"))  # 2*8.50 + 10.00
        self.assertEqual(order.items.count(), 2)
        burger_line = order.items.get(menu_item=self.burger)
        self.assertEqual((burger_line.quantity, burger_line.price), (2, Decimal("8.50")))

    def test_prices_sent_by_the_browser_are_ignored(self):
        cart = json.dumps([{"id": self.burger.pk, "quantity": 1, "price": "0.01"}])
        self.place_order(cart)
        self.assertEqual(Order.objects.get().total_price, Decimal("8.50"))

    def test_saved_item_price_is_a_snapshot(self):
        self.place_order(cart_json((self.burger.pk, 1)))
        self.burger.price = Decimal("99.00")
        self.burger.save()
        self.assertEqual(OrderItem.objects.get().price, Decimal("8.50"))

    def test_empty_cart_is_rejected(self):
        response = self.place_order("[]")
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "checkout.html")
        self.assertIsNotNone(response.context["cart_error"])
        self.assertEqual(Order.objects.count(), 0)

    def test_unknown_items_and_bad_json_are_rejected(self):
        for cart in (cart_json((9999, 1)), "not json", '{"id": 1}', ""):
            response = self.place_order(cart)
            self.assertEqual(response.status_code, 200, cart)
        self.assertEqual(Order.objects.count(), 0)

    def test_missing_required_fields_are_rejected(self):
        for field in ("customer_name", "phone", "address"):
            response = self.place_order(cart_json((self.burger.pk, 1)), **{field: ""})
            self.assertEqual(response.status_code, 200, field)
            self.assertIn(field, response.context["form"].errors)
        self.assertEqual(Order.objects.count(), 0)

    def test_quantity_is_limited(self):
        self.place_order(cart_json((self.burger.pk, 9999)))
        self.assertEqual(OrderItem.objects.get().quantity, 50)

    def test_duplicate_cart_lines_are_merged(self):
        self.place_order(cart_json((self.burger.pk, 1), (self.burger.pk, 2)))
        self.assertEqual(OrderItem.objects.get().quantity, 3)


@STUB_TEMPLATES
class SuccessViewTests(TestCase):
    def test_shows_name_of_the_customer_who_just_ordered(self):
        item = MenuItem.objects.create(
            name="Burger", price=Decimal("8.50"), category=MenuItem.Category.BURGER
        )
        self.client.post(reverse("checkout"), {
            "customer_name": "Khalid", "phone": "0100", "address": "Giza",
            "cart_data": cart_json((item.pk, 1)),
        })
        response = self.client.get(reverse("success"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "success.html")
        self.assertEqual(response.context["customer_name"], "Khalid")
        self.assertEqual(response.context["order_id"], Order.objects.get().pk)

    def test_without_an_order_redirects_to_menu(self):
        response = self.client.get(reverse("success"))
        self.assertRedirects(response, reverse("menu"), fetch_redirect_response=False)