from fastapi import APIRouter, Depends, HTTPException, status, Path, File, Form, UploadFile, Body
from typing import Optional, Union
from sqlalchemy.orm import Session
from pydantic import BaseModel as PydanticBaseModel

from database import get_db
from schemas.category import Category, CategoryCreate, CategoryUpdate
from crud.category_crud import category_crud
from core.security import get_current_active_user, require_admin
from schemas.user import User
from services.image_services import ImageService, FileValidator

class HomepageToggle(PydanticBaseModel):
    show_on_homepage: bool
    homepage_order: int = 0

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
    return category_crud.get_multi(db)

@router.get("/featured", response_model=list[Category], status_code=status.HTTP_200_OK)
def get_featured_categories(db: Session = Depends(get_db)):
    """Categories marked to show on homepage, ordered by homepage_order."""
    from models.category import Category as CategoryModel
    return (
        db.query(CategoryModel)
        .filter(CategoryModel.show_on_homepage == True)
        .order_by(CategoryModel.homepage_order)
        .all()
    )

@router.get("/tree", response_model=list[Category], status_code=status.HTTP_200_OK)
def get_category_tree(db: Session = Depends(get_db)):
    """Tree of top-level categories with their children (public)."""
    return category_crud.get_tree(db)

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
    return category
