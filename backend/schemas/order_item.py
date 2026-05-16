from decimal import Decimal
from typing import Optional, Annotated
from pydantic import Field, ConfigDict, field_validator
from .base import BaseSchema
from .product import ProductDetail

class OrderItemBase(BaseSchema):
    """Base fields for order line items"""
    product_id: Optional[int] = Field(None, examples=[123])
    quantity: int = Field(..., gt=0, le=1000, examples=[2])
    price_at_order: Decimal = Field(
        ...,
        gt=0,
        decimal_places=2,
        examples=[29.99],
        description="Price snapshot at time of purchase"
    )

class OrderItemCreate(BaseSchema):
    """Combined schema for creating order items"""
    product_id: int = Field(..., gt=0, examples=[123])
    quantity: int = Field(..., gt=0, le=100, examples=[2])
    price_at_order: Annotated[Decimal, Field(gt=0, decimal_places=2, examples=[29.99])]

    @field_validator('price_at_order')
    @classmethod
    def validate_price(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Price must be positive") 
        return v.quantize(Decimal("0.01"))
    
class OrderItem(OrderItemBase):
    """Complete order item schema for API responses"""
    id: int = Field(..., examples=[1])
    order_id: int = Field(..., examples=[456])
    product_name: str = Field(..., examples=["Wireless Mouse"])
    product_image_url: Optional[str] = Field(None, examples=["/static/products/11/img_abc123.jpg"])
    total_price: Decimal = Field(
        ...,
        description="Calculated as price_at_order * quantity",
        examples=[59.98]
    )
    product: Optional[ProductDetail] = Field(
        None,
        description="Full product details",
        exclude=True  # Don't include by default in responses
    )

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "order_id": 456,
                "product_id": 123,
                "product_name": "Wireless Mouse",
                "product_image_url": "/static/products/11/img_abc123.jpg",
                "quantity": 2,
                "price_at_order": 29.99,
                "total_price": 59.98,
                "product": {
                    "id": 123,
                    "name": "Wireless Mouse",
                    "price": 29.99
                }
            }
        }
    )

class OrderItemWithProduct(OrderItem):
    """Order item with product details included"""
    product: ProductDetail = Field(..., exclude=False)  # Override to include