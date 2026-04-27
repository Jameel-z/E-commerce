from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from .base_crud import CRUDBase
from models.category import Category
from schemas.category import CategoryCreate, CategoryUpdate

class CategoryCRUD(CRUDBase[Category, CategoryCreate, CategoryUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[Category]:
        return db.query(self.model).filter(self.model.name == name).first()

    def get_tree(self, db: Session) -> List[Category]:
        """Return only top-level categories; children are loaded via relationship."""
        return (
            db.query(self.model)
            .filter(self.model.parent_id == None)
            .options(joinedload(self.model.children))
            .order_by(self.model.name)
            .all()
        )

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 1000):
        """Flat list of all categories ordered by name."""
        return db.query(self.model).order_by(self.model.name).offset(skip).limit(limit).all()

category_crud = CategoryCRUD(Category)
