# backend/schemas/product.py
from datetime import datetime
from typing import Optional, Annotated, TYPE_CHECKING, List
from decimal import Decimal
from pydantic import Field, field_validator, ConfigDict
from fastapi import UploadFile
from .base import BaseSchema, TimestampSchema
from core.utils import generate_static_url

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

    @field_validator('url', mode='before')
    def make_full_url(cls, v):
        return generate_static_url(v)

class ProductList(BaseSchema):
    """Schema for product list view (main page)"""
    id: int
    name: str
    price: Decimal
    regular_price: Optional[Decimal] = None
    sale_price: Optional[Decimal] = None
    is_on_sale: bool = False
    discount_percentage: Optional[int] = None
    primary_image_url: Optional[str] = None
    category_name: Optional[str] = None
    stock_quantity: int = Field(..., ge=0)
    description: Optional[str] = None
    full_description: Optional[str] = None
    sku: Optional[str] = None
    brand: Optional[str] = None
    tags: Optional[str] = None
    condition: Optional[str] = None
    shipping: Optional[str] = None
    vat: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "Premium Wireless Headphones",
                "price": 199.99,
                "regular_price": 249.99,
                "sale_price": 199.99,
                "is_on_sale": True,
                "discount_percentage": 20,
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
        max_length=255,
        examples=["Premium Wireless Headphones"]
    )
    description: Optional[str] = Field(
        default=None,
        max_length=5000,
        examples=["Noise-cancelling Bluetooth headphones..."]
    )
    full_description: Optional[str] = Field(
        default=None,
        description="Rich HTML content for the full product detail page"
    )
    sku: Optional[str] = Field(default=None, max_length=100, examples=["KI1602SUM"])
    brand: Optional[str] = Field(default=None, max_length=100, examples=["PITAKA"])
    tags: Optional[str] = Field(default=None, max_length=500, examples=["PITAKA Iphone 16 Pro Max Edge Case"])
    condition: Optional[str] = Field(default=None, max_length=100, examples=["New"])
    shipping: Optional[str] = Field(default=None, max_length=200, examples=["Free Shipping"])
    vat: Optional[str] = Field(default=None, max_length=100, examples=["Excluding VAT"])
    price: Decimal = Field(..., gt=0, decimal_places=2)
    regular_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    sale_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)

    @field_validator("price")
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError("Price must be greater than zero")
        return v
    
    @field_validator("sale_price")
    def validate_sale_price(cls, v, info):
        if v is not None:
            regular_price = info.data.get("regular_price")
            if regular_price and v >= regular_price:
                raise ValueError("Sale price must be less than regular price")
        return v

class ProductCreate(ProductBase):
    """Schema for creating a new product"""
    stock_quantity: int = Field(..., ge=0, examples=[100])
    # category_id: int = Field(..., gt=0, examples=[1]) make this field optional
    category_id: Optional[int] = Field(None, gt=0, examples=[1])
    class Config:
        arbitrary_types_allowed = True

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v.strip()

class ProductUpdate(BaseSchema):
    """Schema for updating a product"""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    full_description: Optional[str] = Field(None)
    sku: Optional[str] = Field(None, max_length=100)
    brand: Optional[str] = Field(None, max_length=100)
    tags: Optional[str] = Field(None, max_length=500)
    condition: Optional[str] = Field(None, max_length=100)
    shipping: Optional[str] = Field(None, max_length=200)
    vat: Optional[str] = Field(None, max_length=100)
    price: Optional[Annotated[Decimal, Field(gt=0, decimal_places=2)]] = None
    regular_price: Optional[Annotated[Decimal, Field(gt=0, decimal_places=2)]] = None
    sale_price: Optional[Annotated[Decimal, Field(gt=0, decimal_places=2)]] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v.strip() if v else None
    
    @field_validator("sale_price")
    def validate_sale_price(cls, v, info):
        if v is not None:
            regular_price = info.data.get("regular_price")
            if regular_price and v >= regular_price:
                raise ValueError("Sale price must be less than regular price")
        return v

class ProductDetail(TimestampSchema, ProductBase):
    """Schema for single product detail view"""
    id: int
    stock_quantity: int
    category_id: Optional[int] = None
    primary_image_url: Optional[str] = None
    price: Optional[Decimal] = Field(gt=0, decimal_places=2)
    regular_price: Optional[Decimal] = None
    sale_price: Optional[Decimal] = None
    is_on_sale: bool = False
    discount_percentage: Optional[int] = None
    sku: Optional[str] = None
    brand: Optional[str] = None
    tags: Optional[str] = None
    condition: Optional[str] = None
    shipping: Optional[str] = None
    vat: Optional[str] = None
    category: Optional["Category"] = None
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
                "regular_price": 249.99,
                "sale_price": 199.99,
                "is_on_sale": True,
                "discount_percentage": 20,
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


class ProductImageUpdate(BaseSchema):
    """Schema for updating product images"""
    keep_ids: Optional[List[int]] = Field(
        default_factory=list,
        description="IDs of existing images to retain",
        example=[1, 3]
    )
    new_images: Optional[List[UploadFile]] = Field(
        default_factory=list,
        description="New images to upload"
    )

class ProductUpdateRequest(ProductUpdate):
    """Complete product update request schema"""
    images: Optional[ProductImageUpdate] = None
    primary_image: Optional[UploadFile] = None

# Fix for forward references
from .category import Category  
ProductDetail.model_rebuild()