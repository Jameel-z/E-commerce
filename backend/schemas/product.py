from datetime import datetime
from typing import Optional, Annotated, TYPE_CHECKING, List
from decimal import Decimal
from pydantic import Field, field_validator, ConfigDict
from .base import BaseSchema, TimestampSchema

if TYPE_CHECKING:
    from .category import Category

class ProductBase(BaseSchema):
    """Base schema containing common product fields"""
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        examples=["Premium Wireless Headphones"]
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
        examples=["Noise-cancelling Bluetooth headphones with 30hr battery life"]
    )

class ProductCreate(ProductBase):
    """Schema for product creation"""
    price: Annotated[
        Decimal,
        Field(gt=0, decimal_places=2, examples=[99.99])
    ]
    stock_quantity: int = Field(..., ge=0, examples=[100])
    category_id: int = Field(..., examples=[1])

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v.title()

class Product(TimestampSchema, ProductBase):
    """Complete product schema for API responses"""
    id: int
    price: Decimal = Field(..., gt=0, decimal_places=2)
    stock_quantity: int
    category_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "Premium Wireless Headphones",
                "description": "Noise-cancelling Bluetooth headphones...",
                "price": 199.99,
                "stock_quantity": 50,
                "category_id": 3,
                "created_at": "2025-01-01T00:00:00",
                "updated_at": "2025-01-02T00:00:00"
            }
        }
    )

class ProductUpdate(BaseSchema):
    """Schema for partial product updates"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[Annotated[Decimal, Field(gt=0, decimal_places=2)]] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v.title() if v else None

class ProductWithCategory(Product):
    """Extended product schema with category details"""
    category: "Category"

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "Premium Wireless Headphones",
                "description": "Noise-cancelling Bluetooth headphones...",
                "price": 199.99,
                "stock_quantity": 50,
                "category_id": 3,
                "created_at": "2025-01-01T00:00:00",
                "updated_at": "2025-01-02T00:00:00",
                "category": {
                    "id": 3,
                    "name": "Electronics"
                }
            }
        }
    )

# Fix for forward references
from .category import Category  # <-- Add this import at runtime
ProductWithCategory.model_rebuild()