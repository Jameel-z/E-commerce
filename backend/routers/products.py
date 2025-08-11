# backend/routers/product.py
from fastapi import (
    APIRouter, Depends, HTTPException, Query, status, Path,
    UploadFile, File, Form
)
from typing import List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session

from database import get_db
from schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductList,
    ProductDetail,
    ProductImage,
    ProductImageCreate
)
from crud.product_crud import product_crud
from crud.category_crud import category_crud
from core.security import get_current_active_user, require_admin
from core.storage import store_image, delete_image_file
from schemas.user import User
# import annotated and file
from typing import Annotated

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

@router.get("/", response_model=List[ProductList])
def list_products(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None
):
    """Get products for main page listing"""
    return product_crud.get_list(
        db, 
        skip=skip, 
        limit=limit, 
        category_id=category_id
    )

@router.get(
    "/{product_id}",
    response_model=ProductDetail,
    responses={
        404: {"description": "Product not found"}
    }
)
def get_product(
    product_id: int = Path(..., gt=0, description="The ID of the product to retrieve"),
    db: Session = Depends(get_db)
):
    """Get detailed product unformation"""
    product = product_crud.get_detail(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    return product

@router.get(
    "/category/{category_id}",
    response_model=List[ProductList],
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
    response_model=ProductDetail,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
    responses={
        400: {"description": "Invalid category or data"},
        409: {"description": "Product name already exists"}
    }
)
async def create_product(
    name: Annotated[str, Form(example="Wireless Mouse")],
    price: Annotated[Decimal, Form(example=23.99)],
    category_id: Annotated[int, Form(example=1)],
    stock_quantity: Annotated[Optional[int], Form()] = 0,
    description: Annotated[Optional[str], Form()] = None,
    primary_image: Annotated[Optional[UploadFile], File()] = None,
    secondary_images: Annotated[List[UploadFile], File()] = [],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new product (Admin only)."""
    product_data = ProductCreate(
        name=name,
        description=description,
        price=price,
        stock_quantity=stock_quantity,
        category_id=category_id
    )
    
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
    
    # Create the product first
    product = product_crud.create(db, obj_in=product_data)
    
    try:
        # Handle primary image upload
        if primary_image:
            primary_url = await store_image(primary_image, product.id)
            product = product_crud.update_primary_image(
                db, 
                product_id=product.id,
                image_url=primary_url
            )
        
        # Handle secondary images
        for image in secondary_images:
            url = await store_image(image, product.id)
            product_crud.add_product_image(
                db,
                product_id=product.id,
                image_in=ProductImageCreate(url=url)
            )
        
        db.commit()
        return product_crud.get_detail(db, product.id)
    
    except Exception as e:
        db.rollback()
        # Clean up any uploaded files if something went wrong
        if primary_image and hasattr(product, 'primary_image_url'):
            await delete_image_file(product.primary_image_url)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating product: {str(e)}"
        )

@router.put(
    "/{product_id}",
    response_model=ProductDetail,
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
    
    updated_product = product_crud.update(db, db_obj=product, obj_in=product_data)
    
    return product_crud.get_detail(db, product_id=updated_product.id)

@router.post(
        "/{product_id}/images",
        response_model=List[ProductImage],
        dependencies=[Depends(require_admin)]
)
async def add_product_images(
    product_id: int,
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add secondary images to a product (Admin only)."""
    product = product_crud.get(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    uploaded_images = []
    for image in images:
        url = await store_image(image, product_id)
        uploaded_image = product_crud.add_product_image(
            db,
            product_id=product_id,
            image_in=ProductImageCreate(url=url)
        )
        uploaded_images.append(uploaded_image)
    return uploaded_images



@router.patch(
    "/{product_id}/stock",
    response_model=ProductDetail,
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
    """Adjust product stock quantity (Admin only)."""
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

# delete product
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
    """Delete a product (Admin only)."""
    product = product_crud.get(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    
    # Delete primary image file if exists
    if product.primary_image_url:
        try:
            delete_image_file(product.primary_image_url)
        except Exception:
            pass
    # Delete secondary images files
    for image in product.images:
        try:
            delete_image_file(image.url)
        except Exception:
            pass
    
    product_crud.remove(db, id=product_id)
    return None

# delete product image
@router.delete(
    "/{product_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)]
)
async def delete_product_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a secondary image from a product (Admin only)."""
    image = db.query(ProductImage).get(image_id)
    if not image or image.product_id != product_id:
        raise HTTPException(status_code=404, detail="Image not found")
    await delete_image_file(image.url)
    product_crud.delete_product_image(db, image_id=image_id)
    return None