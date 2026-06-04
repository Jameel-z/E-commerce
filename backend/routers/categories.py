from fastapi import APIRouter, Depends, HTTPException, status, Path, File, Form, UploadFile, Body
from fastapi.encoders import jsonable_encoder
from typing import Optional, Union
from sqlalchemy.orm import Session
from pydantic import BaseModel as PydanticBaseModel

from database import get_db
from schemas.category import Category, CategoryCreate, CategoryUpdate
from crud.category_crud import category_crud
from core.security import get_current_active_user, require_admin
from core.cache import cache_get, cache_set, cache_delete
from schemas.user import User
from services.image_services import ImageService, FileValidator

def _invalidate_category_cache():
    cache_delete("categories:all", "categories:featured", "categories:rows", "categories:tree")

class HomepageToggle(PydanticBaseModel):
    show_on_homepage: bool
    homepage_order: int = 0

class RowPinsPayload(PydanticBaseModel):
    product_ids: list[int] = []

class CategoryRowToggle(PydanticBaseModel):
    show_category_row: bool
    category_row_order: int = 0

router = APIRouter(
    prefix="/categories",
    responses={
        404: {"description": "Category not found"},
        400: {"description": "Invalid request data"}
    }
)

@router.get("/", response_model=list[Category], status_code=status.HTTP_200_OK)
def get_categories(db: Session = Depends(get_db)):
    """Flat list of all categories (public)."""
    cached = cache_get("categories:all")
    if cached is not None:
        return cached
    result = category_crud.get_multi(db)
    data = jsonable_encoder(result)
    cache_set("categories:all", data, ttl=300)
    return data

@router.get("/category-rows", response_model=list[Category], status_code=status.HTTP_200_OK)
def get_category_rows(db: Session = Depends(get_db)):
    """Parent categories with show_category_row=True, ordered by category_row_order."""
    cached = cache_get("categories:rows")
    if cached is not None:
        return cached
    from models.category import Category as CategoryModel
    result = (
        db.query(CategoryModel)
        .filter(CategoryModel.show_category_row == True, CategoryModel.parent_id == None)
        .order_by(CategoryModel.category_row_order)
        .all()
    )
    data = jsonable_encoder(result)
    cache_set("categories:rows", data, ttl=300)
    return data

@router.get("/featured", response_model=list[Category], status_code=status.HTTP_200_OK)
def get_featured_categories(db: Session = Depends(get_db)):
    """Categories marked to show on homepage, ordered by homepage_order."""
    cached = cache_get("categories:featured")
    if cached is not None:
        return cached
    from models.category import Category as CategoryModel
    result = (
        db.query(CategoryModel)
        .filter(CategoryModel.show_on_homepage == True)
        .order_by(CategoryModel.homepage_order)
        .all()
    )
    data = jsonable_encoder(result)
    cache_set("categories:featured", data, ttl=300)
    return data

@router.get("/tree", response_model=list[Category], status_code=status.HTTP_200_OK)
def get_category_tree(db: Session = Depends(get_db)):
    """Tree of top-level categories with their children (public)."""
    cached = cache_get("categories:tree")
    if cached is not None:
        return cached
    result = category_crud.get_tree(db)
    data = jsonable_encoder(result)
    cache_set("categories:tree", data, ttl=300)
    return data

@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_category(
    name: str = Form(..., min_length=2, max_length=50),
    parent_id: Optional[int] = Form(None),
    image: Union[UploadFile, str, None] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    formatted_name = name.strip().title()
    existing = category_crud.get_by_name(db, name=formatted_name)
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    if parent_id:
        parent = category_crud.get(db, id=parent_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")
        if parent.parent_id is not None:
            raise HTTPException(status_code=400, detail="Only one level of nesting is allowed")

    category_in = CategoryCreate(name=formatted_name, parent_id=parent_id)
    db_category = category_crud.create(db, obj_in=category_in)

    validated_image = await FileValidator.validate_single(image)
    if validated_image:
        image_url = await ImageService.save_category_image(validated_image, db_category.id)
        db_category.image_url = image_url
        db.commit()
        db.refresh(db_category)

    _invalidate_category_cache()
    return db_category

@router.put("/{category_id}", response_model=Category, status_code=status.HTTP_200_OK, dependencies=[Depends(require_admin)])
async def update_category(
    category_id: int = Path(..., gt=0),
    name: Optional[str] = Form(None),
    parent_id: Optional[int] = Form(None),
    image: Union[UploadFile, str, None] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_category = category_crud.get(db, id=category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    if name is not None:
        formatted_name = name.strip().title()
        existing = category_crud.get_by_name(db, name=formatted_name)
        if existing and existing.id != category_id:
            raise HTTPException(status_code=400, detail="Category with this name already exists")
        db_category.name = formatted_name

    if parent_id is not None:
        if parent_id == 0:
            db_category.parent_id = None
        else:
            parent = category_crud.get(db, id=parent_id)
            if not parent:
                raise HTTPException(status_code=404, detail="Parent category not found")
            if parent.parent_id is not None:
                raise HTTPException(status_code=400, detail="Only one level of nesting is allowed")
            db_category.parent_id = parent_id

    validated_image = await FileValidator.validate_single(image)
    if validated_image:
        if db_category.image_url:
            ImageService.delete_image(db_category.image_url)
        db_category.image_url = await ImageService.save_category_image(validated_image, category_id)

    db.commit()
    db.refresh(db_category)
    _invalidate_category_cache()
    return db_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_category(
    category_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    category = category_crud.get(db, id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.image_url:
        ImageService.delete_image(category.image_url)
    category_crud.remove(db, id=category_id)
    _invalidate_category_cache()

@router.get(
    "/{category_id}/row-pins",
    response_model=list[int],
    summary="Get pinned product IDs for a category row",
)
def get_row_pins(
    category_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    from models.category_row_pin import CategoryRowPin
    pins = (
        db.query(CategoryRowPin.product_id)
        .filter(CategoryRowPin.category_id == category_id)
        .order_by(CategoryRowPin.pin_order)
        .all()
    )
    return [p[0] for p in pins]

@router.put(
    "/{category_id}/row-pins",
    response_model=list[int],
    dependencies=[Depends(require_admin)],
    summary="Set pinned products for a category row",
)
def set_row_pins(
    category_id: int = Path(..., gt=0),
    payload: RowPinsPayload = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from models.category_row_pin import CategoryRowPin
    db.query(CategoryRowPin).filter(CategoryRowPin.category_id == category_id).delete()
    for order, product_id in enumerate(payload.product_ids):
        db.add(CategoryRowPin(category_id=category_id, product_id=product_id, pin_order=order))
    db.commit()
    _invalidate_category_cache()
    return payload.product_ids

@router.patch(
    "/{category_id}/category-row",
    response_model=Category,
    dependencies=[Depends(require_admin)],
    summary="Toggle category product row on homepage",
)
def set_category_row(
    category_id: int = Path(..., gt=0),
    payload: CategoryRowToggle = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from models.category import Category as CategoryModel
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category.show_category_row = payload.show_category_row
    category.category_row_order = payload.category_row_order
    db.commit()
    db.refresh(category)
    _invalidate_category_cache()
    return category

@router.patch(
    "/{category_id}/featured",
    response_model=Category,
    dependencies=[Depends(require_admin)],
    summary="Toggle category homepage visibility",
)
def set_category_featured(
    category_id: int = Path(..., gt=0),
    payload: HomepageToggle = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from models.category import Category as CategoryModel
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category.show_on_homepage = payload.show_on_homepage
    category.homepage_order = payload.homepage_order
    db.commit()
    db.refresh(category)
    _invalidate_category_cache()
    return category
