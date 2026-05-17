# backend/models/product.py
from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from .base import Base

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="images")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    full_description = Column(Text, nullable=True)
    sku = Column(String(100), nullable=True, unique=True)
    brand = Column(String(100), nullable=True)
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    condition = Column(String(100), nullable=True)   # e.g. "New", "Refurbished"
    shipping = Column(String(200), nullable=True)    # e.g. "Free Shipping"
    vat = Column(String(100), nullable=True)         # e.g. "Excluding VAT"
    primary_image_url = Column(String)
    price = Column(Numeric(10, 2), nullable=False)  # Current price (what customer pays)
    regular_price = Column(Numeric(10, 2), nullable=True)  # Original price (for display when on sale)
    sale_price = Column(Numeric(10, 2), nullable=True)  # Discounted price (optional)
    stock_quantity = Column(Integer, default=0)
    reserved_quantity = Column(Integer, default=0)  # Stock reserved for pending orders
    category_id = Column(Integer, ForeignKey("categories.id"))
    is_featured = Column(Boolean, default=False, nullable=False)
    featured_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    category = relationship("Category", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    
    @property
    def is_on_sale(self):
        """Check if product is currently on sale"""
        return (
            self.sale_price is not None 
            and self.regular_price is not None 
            and self.sale_price < self.regular_price
        )
    
    @property
    def discount_percentage(self):
        """Calculate discount percentage"""
        if self.is_on_sale:
            return int(((self.regular_price - self.sale_price) / self.regular_price) * 100)
        return None