from sqlalchemy.orm import Session
from typing import List
from fastapi import HTTPException, status
from .base_crud import CRUDBase
from models.order import Order
from models.order_item import OrderItem
from models.product import Product
from schemas.order import OrderCreate, OrderUpdate
import logging

logger = logging.getLogger(__name__)

class OrderCRUD(CRUDBase[Order, OrderCreate, OrderUpdate]):
    """Order-specific business logic"""
    
    def reserve_stock(self, db: Session, product_id: int, quantity: int) -> None:
        """Reserve stock for an order (prevents overselling)"""
        product = db.query(Product).filter(Product.id == product_id).with_for_update().first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product_id} not found"
            )
        
        available = product.stock_quantity - (product.reserved_quantity or 0)
        if quantity > available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product {product.id}. Available: {available}"
            )
        
        product.reserved_quantity = (product.reserved_quantity or 0) + quantity
        db.commit()
        logger.info(f"Reserved {quantity} units of product {product_id}")
    
    def release_stock(self, db: Session, product_id: int, quantity: int) -> None:
        """Release reserved stock (e.g., when order is cancelled)"""
        product = db.query(Product).filter(Product.id == product_id).with_for_update().first()
        if product:
            product.reserved_quantity = max(0, (product.reserved_quantity or 0) - quantity)
            db.commit()
            logger.info(f"Released {quantity} units of product {product_id}")
    
    def confirm_stock(self, db: Session, product_id: int, quantity: int) -> None:
        """Deduct from actual stock and release the reservation"""
        product = db.query(Product).filter(Product.id == product_id).with_for_update().first()
        if not product:
            return

        product.stock_quantity = max(0, product.stock_quantity - quantity)
        product.reserved_quantity = max(0, (product.reserved_quantity or 0) - quantity)
        db.commit()
        logger.info(f"Confirmed order - deducted {quantity} units from product {product_id}")

    def restore_stock(self, db: Session, product_id: int, quantity: int) -> None:
        """Restore actual stock when a confirmed order is cancelled"""
        product = db.query(Product).filter(Product.id == product_id).with_for_update().first()
        if not product:
            return

        product.stock_quantity = product.stock_quantity + quantity
        db.commit()
        logger.info(f"Restored {quantity} units to product {product_id}")
    
    def create_with_items(
        self,
        db: Session,
        *,
        obj_in: OrderCreate,
        user_id: int
    ) -> Order:
        """Create order with stock reservation"""
        try:
            # Reserve stock for all items first
            for item in obj_in.order_items:
                self.reserve_stock(db, item.product_id, item.quantity)
            
            # Calculate total
            order_data = obj_in.model_dump(exclude={"order_items"})
            order_data["user_id"] = user_id
            order_data["total_amount"] = sum(
                item.price_at_order * item.quantity 
                for item in obj_in.order_items
            )
            
            # Create order
            db_order = self.model(**order_data)
            db.add(db_order)
            db.flush()  # Get order ID without committing
            
            # Create order items
            for item in obj_in.order_items:
                # Get product to store name snapshot
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if not product:
                    raise ValueError(f"Product {item.product_id} not found")
                
                order_item = OrderItem(
                    order_id=db_order.id,
                    product_id=item.product_id,
                    product_name=product.name,  # Store product name snapshot
                    product_image_url=product.primary_image_url,  # Store product image snapshot
                    quantity=item.quantity,
                    price_at_order=item.price_at_order,
                    total_price=item.price_at_order * item.quantity  # Calculate total
                )
                db.add(order_item)
            
            db.commit()
            db.refresh(db_order)
            return db_order
        except Exception as e:
            # Rollback stock reservations on failure
            db.rollback()
            for item in obj_in.order_items:
                try:
                    self.release_stock(db, item.product_id, item.quantity)
                except:
                    pass
            raise e
    
    def update_order_status(
        self,
        db: Session,
        order_id: int,
        new_status: str,
        order_items: List = None
    ) -> Order:
        """Update order status with stock management"""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        old_status = order.status

        # → delivered: deduct actual stock and release the reservation
        if new_status == "delivered":
            if order_items:
                for item in order_items:
                    self.confirm_stock(db, item.product_id, item.quantity)

        # cancelled at any pre-delivery stage: just release the reservation
        # (stock was never actually deducted, only reserved)
        elif new_status == "cancelled" and old_status in ("pending", "processing", "shipped"):
            if order_items:
                for item in order_items:
                    self.release_stock(db, item.product_id, item.quantity)
        
        order.status = new_status
        db.commit()
        db.refresh(order)
        return order
    
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