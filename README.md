# 🍽️ Django Restaurant Ordering System

A full-stack restaurant ordering web application built with **Django**, **HTML, CSS, and JavaScript**.

The application allows customers to browse a restaurant menu, search and filter meals, view detailed item information, manage a dynamic shopping cart, and place orders through a checkout system.

This project was developed as a comprehensive **full-stack web development project**, demonstrating backend development with Django, relational database design, server-side rendering with Django Templates, and client-side interactivity with JavaScript.

---

## ✨ Features

### 🏠 Dynamic Home Page
- Restaurant information and branding
- Featured/popular menu items
- Category navigation
- Responsive layout

### 🍔 Interactive Menu
- Browse all available menu items
- Search menu items by name
- Filter items by category
- Supported categories include:
  - Burger
  - Pizza
  - Pasta
  - Drink
  - Dessert

### 📋 Menu Item Details
Each menu item has a dedicated details page containing:
- Item name
- Description
- Price
- Rating
- Category
- Uploaded image

### 🛒 Dynamic Shopping Cart
The shopping cart uses JavaScript to provide an interactive experience:
- Add items to the cart
- Remove items
- Increase/decrease quantities
- Automatically calculate item totals
- Automatically calculate the cart total
- Update the cart without unnecessary page reloads

### 💳 Checkout & Order Processing
Customers can submit an order by providing:
- Name
- Phone number
- Address

The system processes the order and stores the order information and purchased items in the database.

### 🔐 Django Admin Dashboard
The built-in Django Admin interface allows restaurant staff to:
- Add and edit menu items
- Manage menu categories
- Upload menu item images
- View incoming orders
- Manage order information

### 📱 Responsive UI
The frontend is designed to work across different screen sizes and includes:
- Responsive layouts
- Modern cards
- Hover effects
- Mobile-friendly navigation
- Interactive UI elements

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Python** | Backend programming language |
| **Django** | Web framework and backend |
| **HTML5** | Page structure |
| **CSS3** | Styling and responsive design |
| **JavaScript** | Client-side interactivity |
| **SQLite** | Development database |
| **Django Templates** | Server-side rendering |
| **Django Admin** | Administrative interface |
| **Pillow** | Image processing for `ImageField` |

---

## 🗄️ Database Design

The application uses three core relational models:

### `MenuItem`

Stores information about each food item.

Typical fields include:

- `name`
- `description`
- `price`
- `rating`
- `category`
- `image`

### `Order`

Represents a customer's order.

Stores information such as:

- Customer name
- Phone number
- Address
- Total price
- Order creation timestamp

### `OrderItem`

Represents the individual items contained within an order.

It connects an `Order` with its corresponding `MenuItem` records and stores:

- The selected menu item
- Quantity
- Price at the time of purchase

This allows a single order to contain multiple menu items while preserving the purchase details.

### Relationship

```text
Order
  │
  ├── OrderItem ─── MenuItem
  ├── OrderItem ─── MenuItem
  └── OrderItem ─── MenuItem
```

An `Order` can contain multiple `OrderItem` records, while each `OrderItem` references a specific `MenuItem`.

---

## 📁 Project Structure

A simplified project structure looks like this:

```text
restaurant-django-project/
│
├── manage.py
│
├── restaurant/
│   ├── settings.py
│   ├── urls.py
│   └── ...
│
├── <app_name>/
│   ├── migrations/
│   ├── templates/
│   ├── static/
│   ├── admin.py
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── ...
│
├── media/
│   └── ...
│
├── db.sqlite3
├── requirements.txt
└── README.md
```

> Replace `<app_name>` with the actual Django application name used in the project.

---

# 🚀 Installation & Setup

Follow the steps below to run the project locally.

## Prerequisites

Make sure you have the following installed:

- **Python 3.8+**
- **pip**
- **Git**

---

## 1. Clone the Repository

```bash
git clone https://github.com/Khalid-Abdullah-cmd/-Restaurant-Ordering-Website.git
cd -Restaurant-Ordering-Website
```

---

## 2. Create a Virtual Environment

Creating a virtual environment is recommended to isolate the project's dependencies.

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 3. Install Dependencies

Install Django and Pillow:

```bash
pip install django pillow
```

If a `requirements.txt` file is included in the repository, you can instead install all dependencies with:

```bash
pip install -r requirements.txt
```

---

## 4. Apply Database Migrations

Create and apply the database migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 5. Create a Superuser

Create an administrator account for the Django Admin dashboard:

```bash
python manage.py createsuperuser
```

Follow the prompts to configure the username, email, and password.

---

## 6. Run the Development Server

Start the Django development server:

```bash
python manage.py runserver
```

---

## 7. Access the Application

### Main Website

```text
http://127.0.0.1:8000/
```

### Django Admin

```text
http://127.0.0.1:8000/admin/
```

Log in using the superuser credentials created earlier.

---

# 🗺️ Application Flow

The typical customer journey through the application is:

```text
Home Page
    │
    ▼
Menu
    │
    ├── Search
    └── Filter by Category
    │
    ▼
Menu Item Details
    │
    ▼
Add to Cart
    │
    ▼
Shopping Cart
    │
    ▼
Checkout
    │
    ▼
Order Processing
    │
    ▼
Order Confirmation
```

### 1. Browse

Visit the homepage to explore the restaurant and featured menu items.

### 2. Search & Filter

Navigate to:

```text
/menu/
```

Search for a specific meal or filter menu items by category.

### 3. View Details

Select a menu item to view its detailed information.

Example:

```text
/menu/<item_id>/
```

### 4. Manage Cart

Add items to the shopping cart and navigate to:

```text
/cart/
```

From there, users can adjust quantities or remove items.

### 5. Checkout

Proceed to:

```text
/checkout/
```

Enter the required customer information and submit the order.

### 6. Order Confirmation

After successful submission, the order is stored in the database and the customer is redirected to the order confirmation page.

---

# 🧠 What This Project Demonstrates

This project demonstrates practical experience with:

- Django project and application structure
- Django Models and ORM
- Relational database design
- Model relationships
- Django migrations
- Django Templates
- URL routing
- Django views
- HTML forms
- HTTP request/response handling
- CRUD operations
- Django Admin
- File and image uploads
- Static and media files
- JavaScript DOM manipulation
- Client-side cart functionality
- Search and filtering
- Order processing
- Responsive frontend development
- Git and GitHub workflow

---


# 📄 License

This project is open-source and available under the **MIT License**.
