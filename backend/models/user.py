from sqlalchemy import Column, Integer, String, Boolean,TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Add guest-specific fields
    is_guest = Column(Boolean, default=False)
    guest_id = Column(String, unique=True, index=True, nullable=True)
    
    # Relationships
    carts = relationship("Cart", back_populates="user")
    orders = relationship("Order", back_populates="user")