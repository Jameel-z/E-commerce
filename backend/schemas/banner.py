from typing import Optional
from pydantic import ConfigDict, Field, field_validator
from .base import BaseSchema
from core.config import settings


def _make_banner_url(path: str) -> str:
    if path.startswith("http"):
        return path
    domain = settings.DOMAIN
    scheme = "http" if "localhost" in domain else "https"
    clean = path.lstrip("/")
    return f"{scheme}://{domain}/static/{clean}"


VALID_POSITIONS = {
    "top-left", "top-center", "top-right",
    "middle-left", "middle-center", "middle-right",
    "bottom-left", "bottom-center", "bottom-right",
}

class BannerBase(BaseSchema):
    title: Optional[str] = Field(None, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=500)
    cta_text: Optional[str] = Field(None, max_length=100)
    cta_link: Optional[str] = Field(None, max_length=500)
    text_position: str = Field("middle-center", max_length=20)
    hide_overlay: bool = False
    is_active: bool = True
    display_order: int = 0


class Banner(BannerBase):
    id: int
    media_url: str
    media_type: str

    @field_validator("media_url", mode="before")
    @classmethod
    def make_full_url(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        return _make_banner_url(v)

    model_config = ConfigDict(from_attributes=True)


class BannerUpdate(BaseSchema):
    title: Optional[str] = Field(None, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=500)
    cta_text: Optional[str] = Field(None, max_length=100)
    cta_link: Optional[str] = Field(None, max_length=500)
    text_position: Optional[str] = Field(None, max_length=20)
    hide_overlay: Optional[bool] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None
