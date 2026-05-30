from fastapi import APIRouter, Depends, HTTPException, status, File, Form, UploadFile
from fastapi.encoders import jsonable_encoder
from typing import Optional, List
from sqlalchemy.orm import Session

from database import get_db
from schemas.banner import Banner, BannerUpdate
from models.banner import Banner as BannerModel
from core.security import require_admin
from core.cache import cache_get, cache_set, cache_delete
from services.image_services import ImageService

router = APIRouter(prefix="/banners")

_BANNER_KEY = "banners:active"


@router.get("/", response_model=List[Banner])
def get_active_banners(db: Session = Depends(get_db)):
    """Return active banners ordered by display_order (public)."""
    cached = cache_get(_BANNER_KEY)
    if cached is not None:
        return cached
    result = (
        db.query(BannerModel)
        .filter(BannerModel.is_active == True)
        .order_by(BannerModel.display_order)
        .all()
    )
    data = jsonable_encoder(result)
    cache_set(_BANNER_KEY, data, ttl=300)
    return data


@router.get("/all", response_model=List[Banner])
def get_all_banners(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Return all banners including inactive (admin only)."""
    return db.query(BannerModel).order_by(BannerModel.display_order).all()


@router.post("/", response_model=Banner, status_code=status.HTTP_201_CREATED)
async def create_banner(
    title: Optional[str] = Form(None),
    subtitle: Optional[str] = Form(None),
    cta_text: Optional[str] = Form(None),
    cta_link: Optional[str] = Form(None),
    text_position: str = Form("middle-center"),
    hide_overlay: bool = Form(False),
    is_active: bool = Form(True),
    display_order: int = Form(0),
    media: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    media_path, media_type = await ImageService.save_banner_media(media)
    banner = BannerModel(
        title=title,
        subtitle=subtitle,
        cta_text=cta_text,
        cta_link=cta_link,
        text_position=text_position,
        hide_overlay=hide_overlay,
        is_active=is_active,
        display_order=display_order,
        media_url=media_path,
        media_type=media_type,
    )
    db.add(banner)
    db.commit()
    db.refresh(banner)
    cache_delete(_BANNER_KEY)
    return banner


@router.put("/{banner_id}", response_model=Banner)
def update_banner(
    banner_id: int,
    data: BannerUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    banner = db.query(BannerModel).filter(BannerModel.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(banner, key, val)
    db.commit()
    db.refresh(banner)
    cache_delete(_BANNER_KEY)
    return banner


@router.delete("/{banner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    banner = db.query(BannerModel).filter(BannerModel.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    db.delete(banner)
    db.commit()
    cache_delete(_BANNER_KEY)
