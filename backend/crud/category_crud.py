from sqlalchemy.orm import Session
from typing import Optional, List
from .base_crud import CRUDBase
from models.category import Category
from schemas.category import CategoryCreate, CategoryUpdate

class CategoryCRUD(CRUDBase[Category, CategoryCreate, CategoryUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[Category]:
        """Get a category by its exact name (case-sensitive)"""
        return db.query(self.model).filter(self.model.name == name).first()
    
    def search_by_name(self, db: Session, *, name: str, skip: int = 0, limit: int = 100) -> List[Category]:
        """Search categories by name (case-insensitive partial match)"""
        return (
            db.query(self.model)
            .filter(self.model.name.ilike(f"%{name}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )

# Instantiate the CategoryCRUD class
category_crud = CategoryCRUD(Category)