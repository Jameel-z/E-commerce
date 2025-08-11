# backend/schemas/product.py
from datetime import datetime
from typing import Optional, Annotated, TYPE_CHECKING, List
from decimal import Decimal
from pydantic import Field, field_validator, ConfigDict
from fastapi import UploadFile, File
from .base import BaseSchema, TimestampSchema

if TYPE_CHECKING:
    from .category import Category

class ProductImageBase(BaseSchema):
    """Base schema for product images"""
    url: str 

class ProductImageCreate(ProductImageBase):
    pass

class ProductImage(ProductImageBase):
    """Schema for product image responses"""
    id: int
    product_id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "url": "/static/products/1/detail1.jpg",
                "product_id": 1,
                "created_at": "2025-08-06T12:00:00"
            }
        }
    )

class ProductList(BaseSchema):
    """Schema for product list view (main page)"""
    id: int
    name: str
    price: Decimal
    primary_image_url: Optional[str] = None
    category_name: str

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "Premium Wireless Headphones",
                "price": 199.99,
                "primary_image_url": "/static/products/1/main.jpg",
                "category_name": "Electronics"
            }
        }
    )

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
        examples=["Noise-cancelling Bluetooth headphones..."]
    )
    price: Decimal = Field(..., gt=0, decimal_places=2)

class ProductCreate(ProductBase):
    """Schema for creating a new product"""
    stock_quantity: int = Field(..., ge=0, examples=[100])
    category_id: int = Field(..., gt=0, examples=[1])
    class Config:
        arbitrary_types_allowed = True

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v.title()

class ProductUpdate(BaseSchema):
    """Schema for updating a product"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[Annotated[Decimal, Field(gt=0, decimal_places=2)]] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None
    primary_image: Optional[UploadFile] = File(None)
    secondary_images: Optional[List[UploadFile]] =File([])

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v.title() if v else None
    @field_validator('primary_image', 'secondary_images')
    def validate_file_type(cls, v):
        allowed_types = ['image/jpeg', 'image/png']
        if isinstance(v, UploadFile) and v.content_type not in allowed_types:
            raise ValueError("Invalid file type")
        return v

class ProductDetail(TimestampSchema, ProductBase):
    """Schema for single product detail view"""
    id: int
    stock_quantity: int
    category_id: int
    primary_image_url: Optional[str] = None
    category: "Category"
    secondary_images: List[ProductImage] = Field(default_factory=list, alias="images")
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "Premium Wireless Headphones",
                "description": "Noise-cancelling Bluetooth headphones...",
                "price": 199.99,
                "stock_quantity": 50,
                "primary_image_url": "/static/products/1/main.jpg",
                "category_id": 3,
                "category": {
                    "id": 3,
                    "name": "Electronics"
                },
                "secondary_images": [
                    {
                        "id": 1,
                        "url": "/static/products/1/detail1.jpg",
                        "product_id": 1,
                        "created_at": "2025-08-06T12:00:00"
                    }
                ],
                "created_at": "2025-01-01T00:00:00",
                "updated_at": "2025-01-02T00:00:00"
            }
        }
    )

# Fix for forward references
from .category import Category  
ProductDetail.model_rebuild()