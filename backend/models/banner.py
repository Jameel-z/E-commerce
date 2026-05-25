from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from .base import Base


class Banner(Base):
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=True)
    subtitle = Column(String(500), nullable=True)
    cta_text = Column(String(100), nullable=True)
    cta_link = Column(String(500), nullable=True)
    media_url = Column(String(500), nullable=False)
    media_type = Column(String(10), nullable=False, default="image")
    text_position = Column(String(20), nullable=False, default="middle-center")
    hide_overlay = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
