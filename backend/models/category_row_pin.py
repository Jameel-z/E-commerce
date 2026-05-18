from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from .base import Base

class CategoryRowPin(Base):
    __tablename__ = "category_row_pins"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    pin_order = Column(Integer, default=0, nullable=False)

    __table_args__ = (
        UniqueConstraint("category_id", "product_id", name="uq_category_product_pin"),
    )
