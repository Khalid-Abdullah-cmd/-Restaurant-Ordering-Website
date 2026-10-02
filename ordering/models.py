from django.db import models

class MenuItem(models.Model):

    class Category(models.TextChoices):
        BURGER = "BURGER", "Burger"
        PIZZA = "PIZZA", "Pizza"
        PASTA = "PASTA", "Pasta"
        DRINK = "DRINK", "Drink"
        DESSERT = "DESSERT", "Dessert"

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0.0
    )

    image = models.ImageField(
        upload_to="menu_items/",
        blank=True,
        null=True
    )

    category = models.CharField(
        max_length=20,
        choices=Category.choices
    )

    def __str__(self):
        return self.name


class Order(models.Model):

    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)    
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"


class OrderItem(models.Model):



    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.PROTECT,
        related_name="order_items"
    )
    
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)


    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name}"