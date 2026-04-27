from sqlalchemy import Column, Integer, ForeignKey, Numeric, String
from sqlalchemy.orm import relationship
from .base import Base

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    product_name = Column(String, nullable=False)  # Store product name snapshot
    product_image_url = Column(String, nullable=True)  # Store product image snapshot
    quantity = Column(Integer, nullable=False)
    price_at_order = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)  # price_at_order * quantity
    
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")