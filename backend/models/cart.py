from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Float
from sqlalchemy.orm import relationship
from .base import Base

class Cart(Base):
    __tablename__ = "carts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    cart_id = Column(String, unique=True, index=True, nullable=True)  # For guest carts
    total_price = Column(Float, default=0.0)  # TODO: Migrate to Numeric(10, 2) in next migration
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="carts")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    price_at_addition = Column(Float, nullable=True)  # Price locked when item added to cart
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items", lazy="joined")