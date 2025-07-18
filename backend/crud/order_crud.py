from sqlalchemy.orm import Session
from typing import List
from .base_crud import CRUDBase
from models.order import Order
from schemas.order import OrderCreate, OrderUpdate

class OrderCRUD(CRUDBase[Order, OrderCreate, OrderUpdate]):
    """Order-specific business logic"""
    
    def create_with_items(
        self,
        db: Session,
        *,
        obj_in: OrderCreate,
        user_id: int
    ) -> Order:
        """Create order with all items and calculate total"""
        order_data = obj_in.model_dump(exclude={"order_items"})
        order_data["user_id"] = user_id
        order_data["total_amount"] = sum(
            item.price_at_order * item.quantity 
            for item in obj_in.order_items
        )
        
        db_order = self.model(**order_data)
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order
    
    def get_user_orders(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Order]:
        return (
            db.query(self.model)
            .filter(self.model.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

order_crud = OrderCRUD(Order)