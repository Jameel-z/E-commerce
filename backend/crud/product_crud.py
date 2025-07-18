from sqlalchemy.orm import Session
from typing import Optional
from .base_crud import CRUDBase
from models import Product
from schemas import ProductCreate, ProductUpdate

class ProductCRUD(CRUDBase[Product, ProductCreate, ProductUpdate]):

    def get_by_name(self, db: Session, *, name: str) -> Optional[Product]:
        return db.query(self.model).filter(self.model.name == name).first()
    
    def update_stock(
            self,
            db: Session,
            *,
            db_obj: Product,
            stock_adjustment: int
    ) -> Product:
        if db_obj.stock_quantity + stock_adjustment < 0:
            raise ValueError("Insufficient stock available")
        
        db_obj.stock_quantity += stock_adjustment
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_in_stock(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100
    ):
        """Return products with stock_quantity > 0."""
        return (
            db.query(self.model)
            .filter(self.model.stock_quantity > 0)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_out_of_stock(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100
    ):
        """Return products with stock_quantity == 0."""
        return (
            db.query(self.model)
            .filter(self.model.stock_quantity == 0)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_category(
        self,
        db: Session,
        category_id: int,
        skip: int = 0,
        limit: int = 100
    ):
        """Return products filtered by category_id."""
        return (
            db.query(self.model)
            .filter(self.model.category_id == category_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
product_crud = ProductCRUD(Product)