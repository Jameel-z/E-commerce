from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    parent_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    image_url = Column(String(500), nullable=True)
    show_on_homepage = Column(Boolean, default=False, nullable=False)
    homepage_order = Column(Integer, default=0, nullable=False)

    products = relationship("Product", back_populates="category")
    parent = relationship("Category", remote_side=[id], back_populates="children", foreign_keys=[parent_id])
    children = relationship("Category", back_populates="parent", foreign_keys=[parent_id])