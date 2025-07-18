from sqlalchemy import Column, Integer, ForeignKey, Numeric, String, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, default="pending")
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")