from sqlalchemy import Column, Integer, ForeignKey, Numeric, String, TIMESTAMP, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, default="pending")
    notes = Column(Text, nullable=True)
    order_method = Column(String, default="online")  # "online" or "whatsapp"
    payment_method = Column(String, nullable=True)  # "cash", "visa", "pickup", etc.
    
    # Shipping information
    customer_name = Column(String(100), nullable=True)
    customer_phone = Column(String(20), nullable=True)
    shipping_address = Column(Text, nullable=True)
    shipping_city = Column(String(100), nullable=True)
    shipping_area = Column(String(100), nullable=True)
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, onupdate=func.now())
    
    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")