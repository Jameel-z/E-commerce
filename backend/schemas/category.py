from typing import Optional, List, TYPE_CHECKING
from pydantic import Field, field_validator, ConfigDict
from .base import BaseSchema

if TYPE_CHECKING:
    from .product import ProductDetail

class CategoryBase(BaseSchema):
    name: str = Field(
        ...,
        min_length=2,
        max_length=50,
        pattern=r"^[a-zA-Z0-9\-_ ]+$",
        examples=["Electronics", "Laptops"],
    )
    description: Optional[str] = Field(None, max_length=255)
    parent_id: Optional[int] = Field(None, description="ID of parent category (None = top-level)")

class CategoryCreate(CategoryBase):
    @field_validator('name')
    @classmethod
    def validate_name_format(cls, v: str) -> str:
        return v.strip().title()

class Category(CategoryBase):
    id: int
    children: List["Category"] = Field(default_factory=list)

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "name": "Laptops",
                "description": None,
                "parent_id": None,
                "children": [
                    {"id": 2, "name": "Lenovo", "parent_id": 1, "children": []},
                    {"id": 3, "name": "Msi", "parent_id": 1, "children": []}
                ]
            }
        }
    )

Category.model_rebuild()

class CategoryUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=2, max_length=50, pattern=r"^[a-zA-Z0-9\-_ ]+$")
    description: Optional[str] = Field(None, max_length=255)
    parent_id: Optional[int] = None

    @field_validator('name')
    @classmethod
    def validate_updated_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return v.strip().title()
        return None

class CategoryWithProducts(Category):
    products: List["ProductDetail"] = Field(default_factory=list)

# Fix forward references
from .product import ProductDetail
CategoryWithProducts.model_rebuild()
