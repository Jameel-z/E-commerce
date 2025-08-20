from typing import Optional, List, TYPE_CHECKING
from pydantic import Field, field_validator, ConfigDict
from .base import BaseSchema
from datetime import datetime

if TYPE_CHECKING:
    from .product import ProductDetail

class CategoryBase(BaseSchema):
    """Base fields for category operations"""
    name: str = Field(
        ...,
        min_length=2,
        max_length=50,
        pattern=r"^[a-zA-Z0-9\-_ ]+$",
        examples=["Electronics", "Home & Garden"],
        description="Unique category name"
    )
    description: Optional[str] = Field(
        None,
        max_length=255,
        examples=["All electronic devices and accessories"],
        description="Brief category description"
    )

class CategoryCreate(CategoryBase):
    """Schema for creating new categories"""
    @field_validator('name')
    @classmethod
    def validate_name_format(cls, v: str) -> str:
        """Ensure consistent naming format"""
        return v.strip().title()

class Category(CategoryBase):
    """Complete category schema for API responses"""
    id: int = Field(..., examples=[1])

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "Electronics",
                "description": "Devices and accessories"
            }
        }
    )

class CategoryWithProducts(Category):
    """Extended category schema including product listings"""
    products: List["ProductDetail"] = Field(
        default_factory=list,
        description="Products belonging to this category"
    )

class CategoryUpdate(BaseSchema):
    """Schema for updating existing categories"""
    name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=50,
        pattern=r"^[a-zA-Z0-9\-_ ]+$"
    )
    description: Optional[str] = Field(None, max_length=255)

    @field_validator('name')
    @classmethod
    def validate_updated_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return v.strip().title()
        return None

# Fix for forward references
from .product import ProductDetail  # <-- Add this import at runtime
CategoryWithProducts.model_rebuild()