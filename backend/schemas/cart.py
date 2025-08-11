from typing import List, Optional
from pydantic import Field, field_validator
from datetime import datetime

from .base import BaseSchema, TimestampSchema
from .product import ProductDetail  # Import your Product schema

class CartBase(BaseSchema):
    """
    Base schema for cart with common fields
    """
    notes: Optional[str] = Field(
        None,
        description="Optional notes about the cart"
    )

class CartItemBase(BaseSchema):
    """
    Base schema for cart items with validation
    """
    product_id: int = Field(
        ...,
        description="ID of the product being added to cart"
    )
    quantity: int = Field(
        default=1,
        gt=0,
        description="Quantity must be a positive integer"
    )

    @field_validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v

class CartItemCreate(CartItemBase):
    """
    Schema for creating new cart items
    """
    pass

class CartItem(CartItemBase):
    """
    Complete cart item schema with product details
    """
    id: int
    product: ProductDetail
    added_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the item was added to cart"
    )
    updated_at: Optional[datetime] = Field(
        None,
        description="When the item was last updated"
    )

class CartCreate(CartBase):
    """
    Schema for creating a new cart
    """
    user_id: int = Field(
        ...,
        description="ID of the user who owns the cart"
    )
    items: Optional[List[CartItemCreate]] = Field(
        None,
        description="Initial items to add to the cart"
    )

class CartUpdate(BaseSchema):
    """
    Schema for updating cart items with action-based modifications
    """
    action: str = Field(
        ...,
        pattern="^(set|increment|decrement|remove)$",
        description="Action to perform: set, increment, decrement, or remove"
    )
    product_id: int = Field(
        ...,
        description="ID of the product to modify"
    )
    quantity: int = Field(
        default=1,
        gt=0,
        description="Quantity to set or adjust by"
    )

class Cart(TimestampSchema):
    """
    Complete cart schema with timestamp inheritance
    """
    id: int
    user_id: Optional[int] = None
    items: List[CartItem] = Field(
        default_factory=list,
        description="List of items in the cart"
    )
    total_price: float = Field(
        0.0,
        description="Calculated total price of all items"
    )

class ShippingOption(BaseSchema):
    """
    Schema for available shipping options
    """
    id: int
    name: str = Field(
        ...,
        max_length=100,
        description="Name of the shipping method"
    )
    description: Optional[str] = Field(
        None,
        max_length=255,
        description="Description of shipping method"
    )
    price: float = Field(
        ...,
        ge=0,
        description="Shipping cost"
    )
    estimated_days: Optional[int] = Field(
        None,
        ge=1,
        description="Estimated delivery days"
    )
    is_express: bool = Field(
        False,
        description="Whether this is express shipping"
    )

class ShippingInfo(BaseSchema):
    """
    Schema for shipping address information
    """
    first_name: str = Field(
        ...,
        max_length=50,
        description="Recipient's first name"
    )
    last_name: str = Field(
        ...,
        max_length=50,
        description="Recipient's last name"
    )
    address1: str = Field(
        ...,
        max_length=100,
        description="Primary street address"
    )
    address2: Optional[str] = Field(
        None,
        max_length=100,
        description="Secondary address line"
    )
    city: str = Field(
        ...,
        max_length=50,
        description="City"
    )
    state: str = Field(
        ...,
        max_length=50,
        description="State/Province"
    )
    zip_code: str = Field(
        ...,
        max_length=20,
        description="Postal/ZIP code"
    )
    country: str = Field(
        ...,
        max_length=50,
        description="Country"
    )
    phone: Optional[str] = Field(
        None,
        max_length=20,
        description="Contact phone number"
    )

class OfflineCheckout(BaseSchema):
    """
    Schema for offline checkout process
    """
    shipping_info: ShippingInfo
    payment_method: str = Field(
        ...,
        description="Selected offline payment method"
    )
    notes: Optional[str] = Field(
        None,
        max_length=500,
        description="Additional checkout notes"
    )
    accept_terms: bool = Field(
        ...,
        description="Must be true to complete checkout"
    )

    @field_validator('payment_method')
    def validate_payment_method(cls, v):
        valid_methods = ["Cash on Delivery", "Bank Transfer", "Pickup in Store"]
        if v not in valid_methods:
            raise ValueError(f"Payment method must be one of: {', '.join(valid_methods)}")
        return v

    @field_validator('accept_terms')
    def terms_must_be_accepted(cls, v):
        if not v:
            raise ValueError('You must accept the terms to checkout')
        return v

# Response model for available payment methods
class PaymentMethodsResponse(BaseSchema):
    methods: List[str] = Field(
        default_factory=lambda: ["Cash on Delivery", "Bank Transfer", "Pickup in Store"],
        description="Available offline payment methods"
    )