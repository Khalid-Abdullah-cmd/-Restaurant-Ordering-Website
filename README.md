🍽️ Django Restaurant Ordering System

A modern, responsive, and dynamic restaurant ordering website built with Django. This project allows customers to browse a food menu, filter and search for specific meals, manage a dynamic shopping cart, and place an order seamlessly.

This project was developed as a comprehensive Final Project demonstrating full-stack web development integrating a backend database, Django templates, and interactive JavaScript features.

✨ Features

Dynamic Home Page: Features restaurant information, popular meals, and category navigation.

Interactive Menu: Browse all available meals. Includes dynamic search functionality and filtering by categories (Burger, Pizza, Pasta, Drink, Dessert).

Detailed View: Dedicated pages for each menu item displaying high-quality images, descriptions, prices, and ratings.

Dynamic Shopping Cart (JavaScript): Users can add items, remove items, and adjust quantities with automatic total calculation without page reloads.

Secure Checkout: Complete order processing system that captures customer information and links it to their selected cart items.

Admin Dashboard: Fully functional Django Admin interface for restaurant staff to manage menu items, categories, and view incoming orders.

Modern UI: Built with responsive design principles, featuring modern cards, hover effects, and a mobile-friendly layout.

🛠️ Tech Stack

Backend: Python, Django

Frontend: HTML5, CSS3, JavaScript

Database: SQLite (Default Django DB)

Media Management: Django File System (for uploading and serving menu item images)

🗄️ Database Models

The system relies on three core relational models:

MenuItem: Stores food items including name, description, price, rating, category, and an uploaded image.

Order: Captures customer details (name, phone, address), the total calculated price, and the timestamp of the order.

OrderItem: Acts as a bridge table establishing a Many-to-One relationship. Links specific MenuItems to an Order, tracking the exact quantity and price at the time of purchase.

🚀 Installation and Setup

Follow these steps to run the project locally on your machine.

Prerequisites

Python 3.8+ installed

Pip (Python package manager)

1. Clone the repository

git clone [https://github.com/yourusername/restaurant-django-project.git](https://github.com/Khalid-Abdullah-cmd/-Restaurant-Ordering-Website)
cd restaurant-django-project


2. Create a Virtual Environment (Recommended)

python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate


3. Install Dependencies

pip install django
# Add any other dependencies here, e.g., Pillow for ImageField
pip install Pillow


4. Apply Database Migrations

python manage.py makemigrations
python manage.py migrate


5. Create a Superuser (Admin Access)

python manage.py createsuperuser


Follow the prompts to set up your admin email and password.

6. Run the Development Server

python manage.py runserver


7. Access the Application

Main Website: http://127.0.0.1:8000/

Admin Panel: http://127.0.0.1:8000/admin/ (Login with the superuser credentials created in Step 5 to start adding MenuItems).

🗺️ Project Navigation Flow

Browse: Visit the homepage to see featured items.

Search / Filter: Navigate to /menu/ to filter meals by category or search by name.

View Details: Click on any item to view its details (/menu/<item_id>/).

Cart Management: Add items, navigate to /cart/, and use the JS-powered interface to adjust quantities.

Checkout: Proceed to /checkout/, enter your name, phone, and address.

Order Confirmation: Upon submission, the order is saved to the DB, and you are redirected to a personalized success screen.

📝 License

This project is open-source and available under the MIT License.
