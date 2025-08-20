from sqlalchemy.orm import Session
from typing import Optional
from .base_crud import CRUDBase
from models.category import Category
from schemas.category import CategoryCreate, CategoryUpdate

class CategoryCRUD(CRUDBase[Category, CategoryCreate, CategoryUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[Category]:
        """Get a category by its exact name (case-sensitive)"""
        return db.query(self.model).filter(self.model.name == name).first()

# Instantiate the CategoryCRUD class
category_crud = CategoryCRUD(Category)