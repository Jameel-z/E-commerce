from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session

from database import get_db
from schemas.category import Category, CategoryCreate
from crud.category_crud import category_crud
from core.security import get_current_active_user, require_admin
from schemas.user import User

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

@router.get("/tree", response_model=list[Category], status_code=status.HTTP_200_OK)
def get_category_tree(db: Session = Depends(get_db)):
    """Tree of top-level categories with their children (public)."""
    return category_crud.get_tree(db)

@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    existing = category_crud.get_by_name(db, name=category_in.name)
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    if category_in.parent_id:
        parent = category_crud.get(db, id=category_in.parent_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")
        if parent.parent_id is not None:
            raise HTTPException(status_code=400, detail="Only one level of nesting is allowed")
    return category_crud.create(db, obj_in=category_in)

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_category(
    category_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    category = category_crud.get(db, id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category_crud.remove(db, id=category_id)
