from .base import BaseSchema, TimestampSchema

# Import order matters - base schemas first, then independent ones, then relationships
from .user import UserBase, UserCreate, UserUpdate, User, UserInDB, GoogleAuthRequest
from .category import CategoryBase, CategoryCreate, Category, CategoryUpdate  # Import Category first
from .product import ProductBase, ProductCreate, ProductUpdate  # Then Product
from .cart import CartBase, CartItemCreate, CartItem, CartItemUpdate, Cart, CartCreate, CartUpdate, OfflineCheckout, ShippingOption, GuestCartMergeRequest, GuestCartItemRequest
from .order_item import OrderItemBase, OrderItemCreate, OrderItem
from .order import OrderBase, OrderCreate, Order, OrderUpdate, OrdersPage

# Now import the relationship schemas after their components are defined
from .category import CategoryWithProducts
from .product import ProductList, ProductDetail, ProductImageBase, ProductImageCreate, ProductImage
from .order_item import OrderItemWithProduct
from .order import OrderWithItems

__all__ = [
    # Base schemas
    'BaseSchema',
    'TimestampSchema',
    
    # User schemas
    'UserBase',
    'UserCreate',
    'UserUpdate',
    'User',
    'UserInDB',
    'GoogleAuthRequest',

    # Category schemas
    'CategoryBase',
    'CategoryCreate',
    'Category',
    'CategoryUpdate',
    'CategoryWithProducts',  # Keep this after basic category schemas

    # Product schemas
    'ProductBase',
    'ProductCreate',
    'ProductUpdate',
    "ProductList",  
    "ProductDetail",   
    "ProductImageBase", 
    'ProductImageCreate',
    'ProductImage',

    # Cart schemas
    'CartBase',
    'CartItemCreate',
    'CartItem',
    'Cart',
    'CartCreate',
    'CartUpdate',
    'OfflineCheckout',
    'ShippingOption',
    'GuestCartMergeRequest',
    'GuestCartItemRequest',
    'CartItemUpdate',

    # OrderItem schemas
    'OrderItemBase',
    'OrderItemCreate',
    'OrderItem',
    'OrderItemWithProduct',

    # Order schemas
    'OrderBase',
    'OrderCreate',
    'Order',
    'OrderUpdate',
    'OrderWithItems',
    'OrdersPage',
]