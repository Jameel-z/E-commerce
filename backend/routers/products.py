from fastapi import APIRouter, Depends, HTTPException, Query, status, Path
from typing import List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models.product import Product
from schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductWithCategory,
    Product
)
from schemas.category import Category
from crud.product_crud import product_crud
from crud.category_crud import category_crud
from core.security import get_current_active_user, require_admin
from schemas.user import User

router = APIRouter(
    prefix="/products",
    responses={
        404: {"description": "Product not found"},
        400: {"description": "Invalid request data"}
    }
)

# --------------------------
# PUBLIC ENDPOINTS
# --------------------------

@router.get("/", response_model=List[ProductWithCategory])
def list_products(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=1000, description="Items per page"),
    name: Optional[str] = Query(None, min_length=2, description="Filter by product name"),
    category_id: Optional[int] = Query(None, ge=1, description="Filter by category ID"),
    min_price: Optional[Decimal] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[Decimal] = Query(None, ge=0, description="Maximum price filter"),
    in_stock: Optional[bool] = Query(None, description="Only products with stock available")
):
    """
    List all products with optional filtering and pagination.
    Returns:
    - List of products with full details including category information
    """
    filters = {}
    if name:
        filters["name"] = name
    if category_id:
        if not category_crud.get(db, category_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with ID {category_id} doesn't exist"
            )
        filters["category_id"] = category_id
    if min_price is not None:
        filters["price_ge"] = min_price
    if max_price is not None:
        filters["price_le"] = max_price

    # Use the dedicated method for in_stock filtering
    if in_stock:
        products = product_crud.get_in_stock(db, skip=skip, limit=limit)
    elif in_stock is False:
        products = product_crud.get_out_of_stock(db, skip=skip, limit=limit)
    else:
        products = product_crud.get_multi(db, skip=skip, limit=limit, **filters)

    return products

@router.get(
    "/{product_id}",
    response_model=ProductWithCategory,
    responses={
        404: {"description": "Product not found"}
    }
)
def get_product(
    product_id: int = Path(..., gt=0, description="The ID of the product to retrieve"),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific product.
    
    Parameters:
    - product_id: The ID of the product to retrieve
    
    Returns:
    - Complete product details including category information
    """
    product = product_crud.get(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    return product

@router.get(
    "/category/{category_id}",
    response_model=List[ProductWithCategory],
    responses={
        404: {"description": "Category not found"}
    }
)
def get_products_by_category(
    category_id: int = Path(..., gt=0, description="The ID of the category"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=1000, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    List all products belonging to a specific category.
    """
    if not category_crud.get(db, category_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found"
        )
    return product_crud.get_by_category(db, category_id=category_id, skip=skip, limit=limit)

# --------------------------
# ADMIN-ONLY ENDPOINTS
# --------------------------

@router.post(
    "/",
    response_model=ProductWithCategory,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
    responses={
        400: {"description": "Invalid category or data"},
        409: {"description": "Product name already exists"}
    }
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new product (Admin only).
    
    Parameters:
    - product_data: Product creation data
    
    Returns:
    - The newly created product with full details
    """
    # Check for existing product with same name
    if product_crud.get_by_name(db, name=product_data.name):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product with this name already exists"
        )
    
    # Validate category exists
    if not category_crud.get(db, product_data.category_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with ID {product_data.category_id} doesn't exist"
        )
    
    return product_crud.create(db, obj_in=product_data)

@router.put(
    "/{product_id}",
    response_model=ProductWithCategory,
    dependencies=[Depends(require_admin)],
    responses={
        400: {"description": "Invalid data"},
        404: {"description": "Product not found"}
    }
)
def update_product(
    product_id: int = Path(..., gt=0, description="The ID of the product to update"),
    product_data: ProductUpdate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing product (Admin only).
    
    Parameters:
    - product_id: The ID of the product to update
    - product_data: Product update data (partial updates supported)
    
    Returns:
    - The updated product with full details
    """
    product = product_crud.get(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    
    # If name is being updated, check for conflicts
    if product_data.name and product_data.name != product.name:
        if product_crud.get_by_name(db, name=product_data.name):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Product with this name already exists"
            )
    
    # Validate category if being updated
    if product_data.category_id and not category_crud.get(db, product_data.category_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with ID {product_data.category_id} doesn't exist"
        )
    
    return product_crud.update(db, db_obj=product, obj_in=product_data)

@router.patch(
    "/{product_id}/stock",
    response_model=ProductWithCategory,
    dependencies=[Depends(require_admin)],
    responses={
        400: {"description": "Invalid stock adjustment"},
        404: {"description": "Product not found"}
    }
)
def adjust_stock(
    product_id: int = Path(..., gt=0, description="The ID of the product"),
    adjustment: int = Query(..., description="Amount to adjust stock by (positive or negative)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Adjust product stock quantity (Admin only).
    
    Parameters:
    - product_id: The ID of the product
    - adjustment: The amount to adjust stock by (positive to add, negative to subtract)
    
    Returns:
    - The updated product with full details
    """
    product = product_crud.get(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    
    try:
        updated_product = product_crud.update_stock(
            db,
            db_obj=product,
            stock_adjustment=adjustment
        )
        return updated_product
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
    responses={
        404: {"description": "Product not found"}
    }
)
def delete_product(
    product_id: int = Path(..., gt=0, description="The ID of the product to delete"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a product (Admin only).
    
    Parameters:
    - product_id: The ID of the product to delete
    
    Returns:
    - 204 No Content on successful deletion
    """
    product = product_crud.get(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    
    product_crud.remove(db, id=product_id)
    return None