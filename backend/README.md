# FastAPI E-commerce Backend

A robust and scalable e-commerce backend API built with FastAPI, providing a full suite of features for managing products, users, carts, and orders.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/User)
  - Guest cart support

- 📦 **Product Management**
  - CRUD operations for products
  - Category organization
  - Stock management
  - Rich filtering and search capabilities

- 🛒 **Shopping Cart**
  - Persistent carts for users
  - Guest cart support with cookie-based tracking
  - Cart merging after user login
  - Real-time stock validation

- 📝 **Order Management**
  - Order creation and tracking
  - Order history
  - Multiple payment method support
  - Shipping information handling

- 👥 **User Management**
  - User registration and authentication
  - Profile management
  - Password security with bcrypt

## Tech Stack

- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Primary database
- **Pydantic** - Data validation using Python type annotations
- **JSON Web Tokens (JWT)** - Secure authentication
- **Bcrypt** - Password hashing
- **CORS Middleware** - Cross-Origin Resource Sharing support

## Requirements

- Python 3.8+
- PostgreSQL
- pip

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   # or
   .\venv\Scripts\activate  # Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root with the following content:
   ```
   # Security settings
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60

   # Database settings
   DB_USER=postgres
   DB_PASSWORD=your-password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ecommerce_db
   ```

5. Create the database:
   ```bash
   # The application will create the database and tables automatically on startup
   ```

## Running the Application

1. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

2. Access the API documentation:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /users/token` - Login and get access token
- `POST /users/` - Register new user
- `GET /users/me` - Get current user profile

### Products
- `GET /products/` - List products with filtering
- `GET /products/{product_id}` - Get product details
- `POST /products/` - Create product (Admin)
- `PUT /products/{product_id}` - Update product (Admin)
- `PATCH /products/{product_id}/stock` - Adjust stock (Admin)
- `DELETE /products/{product_id}` - Delete product (Admin)

### Categories
- `GET /categories/` - List categories
- `POST /categories/` - Create category (Admin)
- `DELETE /categories/{category_id}` - Delete category (Admin)

### Cart
- `GET /carts/my-cart` - Get user's cart
- `POST /carts/add-item` - Add item to cart
- `PATCH /carts/update-item` - Update cart item
- `DELETE /carts/remove-item/{product_id}` - Remove item from cart
- `DELETE /carts/clear` - Clear cart
- `POST /carts/merge` - Merge guest cart with user cart

### Orders
- `POST /orders/` - Create order
- `GET /orders/` - List user orders
- `GET /orders/{order_id}` - Get order details
- `PATCH /orders/{order_id}` - Update order status (Admin)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- CORS protection
- HTTP-only cookies for guest carts
- Input validation with Pydantic

## Best Practices

- Type hints throughout the codebase
- Dependency injection
- Repository pattern with CRUD base class
- Error handling with appropriate HTTP status codes
- Database transaction management
- Efficient database queries
- Automated database migrations
- Environment variable configuration

## Project Structure

```
backend/
├── core/
│   ├── config.py         # Configuration settings
│   └── security.py       # Authentication & security
├── crud/
│   ├── base_crud.py      # Base CRUD operations
│   ├── cart_crud.py      # Cart operations
│   ├── category_crud.py  # Category operations
│   ├── order_crud.py     # Order operations
│   ├── product_crud.py   # Product operations
│   └── user_crud.py      # User operations
├── models/
│   ├── cart.py          # Cart & CartItem models
│   ├── category.py      # Category model
│   ├── order.py         # Order model
│   ├── product.py       # Product model
│   └── user.py          # User model
├── routers/
│   ├── carts.py         # Cart endpoints
│   ├── categories.py    # Category endpoints
│   ├── products.py      # Product endpoints
│   └── users.py         # User endpoints
├── schemas/
│   ├── cart.py          # Cart Pydantic schemas
│   ├── category.py      # Category schemas
│   ├── order.py         # Order schemas
│   ├── product.py       # Product schemas
│   └── user.py          # User schemas
├── database.py          # Database configuration
├── main.py             # Application entry point
└── requirements.txt    # Project dependencies
```

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to your branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
