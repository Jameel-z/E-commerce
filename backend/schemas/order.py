# schemas/order.py
from datetime import datetime
from typing import Optional, List, Annotated
from decimal import Decimal
from pydantic import Field, field_validator, ConfigDict
from .base import BaseSchema, TimestampSchema
from .order_item import OrderItem, OrderItemCreate

class OrderBase(BaseSchema):
    """
    Base schema containing common order fields.
    Includes status tracking and optional customer notes.
    """
    status: str = Field(
        default="pending",
        examples=["pending", "processing", "shipped", "delivered", "cancelled"],
        description="Current state of the order workflow"
    )
    notes: Optional[str] = Field(
        None,
        max_length=500,
        examples=["Leave with neighbor", "Gift wrapping requested"],
        description="Optional customer instructions"
    )
    order_method: str = Field(
        default="online",
        examples=["online", "whatsapp"],
        description="Method used to place the order"
    )
    payment_method: Optional[str] = Field(
        None,
        examples=["cash", "visa", "pickup"],
        description="Payment method selected"
    )
    
    # Shipping information
    customer_name: Optional[str] = Field(
        None,
        max_length=100,
        examples=["John Doe"],
        description="Customer full name"
    )
    customer_phone: Optional[str] = Field(
        None,
        max_length=20,
        examples=["+1234567890"],
        description="Customer phone number"
    )
    shipping_address: Optional[str] = Field(
        None,
        max_length=500,
        examples=["123 Main St, Apt 4B"],
        description="Full shipping address"
    )
    shipping_city: Optional[str] = Field(
        None,
        max_length=100,
        examples=["New York"],
        description="City"
    )
    shipping_area: Optional[str] = Field(
        None,
        max_length=100,
        examples=["Manhattan"],
        description="Area/District"
    )

class OrderCreate(OrderBase):
    """Schema for order creation requests"""
    user_id: int = Field(..., gt=0, examples=[456])
    order_items: List[OrderItemCreate] = Field(
        ...,
        min_length=1,
        description="At least one order item required",
        examples=[{"product_id": 123, "quantity": 2, "price_at_order": 29.99}]
    )

    @field_validator('status')
    @classmethod
    def validate_initial_status(cls, v: str) -> str:
        allowed = {"pending", "processing"}
        if v.lower() not in allowed:
            raise ValueError(f"New orders must have status: {allowed}")
        return v.lower()

class Order(TimestampSchema, OrderBase):
    """Complete order response schema with system-generated fields"""
    id: int = Field(..., examples=[1])
    order_code: str = Field(..., examples=["I12345"], description="Unique order code")
    user_id: int = Field(..., examples=[456])
    total_amount: Annotated[Decimal, Field(gt=0, decimal_places=2, examples=[59.98])]
    order_method: str = Field(default="online", examples=["online", "whatsapp"])
    payment_method: Optional[str] = Field(None, examples=["cash", "visa"])
    order_items: List['OrderItem'] = Field(default_factory=list, exclude=False)
    created_at: datetime = Field(..., examples=["2023-01-01T00:00:00"])
    updated_at: Optional[datetime] = Field(default=None, examples=["2023-01-01T00:00:00"])
    
    # Configuration for OpenAPI examples
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [{
                "id": 1,
                "user_id": 456,
                "status": "processing",
                "total_amount": 59.98,
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-02T00:00:00",
                "notes": "Please ring doorbell",
                "order_items": [{
                    "product_id": 123,
                    "quantity": 2,
                    "price_at_order": 29.99
                }]
            }]
        }
    )

class OrderUpdate(BaseSchema):
    """Schema for partial order updates"""
    status: Optional[str] = Field(
        None,
        examples=["shipped", "delivered", "cancelled"],
        description="Can only progress forward in workflow"
    )
    notes: Optional[str] = Field(None, max_length=500)

    @field_validator('status')
    @classmethod
    def validate_status_transition(cls, v: Optional[str]) -> Optional[str]:
        if v and v.lower() not in {"processing", "shipped", "delivered", "cancelled"}:
            raise ValueError("Can only update to processing, shipped, delivered, or cancelled")
        return v.lower() if v else None

class OrderWithItems(Order):
    """Order response with expanded item details"""
    order_items: List['OrderItem'] = Field(..., exclude=False)

class OrdersPage(BaseSchema):
    """Paginated orders response"""
    orders: List[Order]
    total: int
    page: int
    per_page: int