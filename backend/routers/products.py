# backend/routers/product.py
from fastapi import (
    APIRouter, Depends, HTTPException, Query, status, Path,
    UploadFile, File, Form
)
from typing import List, Optional, Annotated, Union
from decimal import Decimal
from sqlalchemy.orm import Session
from database import get_db
from schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductList,
    ProductDetail,
    ProductImageUpdate
)
from crud.product_crud import product_crud
from core.security import get_current_active_user, require_admin
from schemas.user import User
from services.image_services import ImageService, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/products",
    responses={
        404: {"description": "Product not found"},
        400: {"description": "Invalid request data"},
        415: {"description": "Unsupported media type"}
    }
)

# --------------------------
# PUBLIC ENDPOINTS
# --------------------------

@router.get("/",
             response_model=List[ProductList],
             summary="List Products",
             description="Retrieve paginated list of products with optional filtering",
             response_description="List of product summaries"
)
def list_products(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description="Items per page"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search term")
):
    """Get paginated products with optional filters."""
    return product_crud.get_list(
        db, 
        skip=(page - 1) * per_page, 
        limit=per_page, 
        category_id=category_id,
        search_term=search
    )

@router.get(
    "/{product_id}",
    response_model=ProductDetail,
    summary="Get Product Details",
    responses={
        404: {"model": None, "description": "Product not found"}
    }
)
def get_product(
    product_id: int = Path(..., gt=0, description="Product ID"),
    db: Session = Depends(get_db)
):
    """Get detailed product information including images."""
    product = product_crud.get_detail(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    return product

# --------------------------
# ADMIN-ONLY ENDPOINTS
# --------------------------

# Custom validator function
def validate_file_input(v):
    """Handle different file input types"""
    logger.info(f"validate_file_input received: {type(v)} - {v}")
    
    if v is None:
        logger.info("validate_file_input: returning None (v is None)")
        return None
    if isinstance(v, str) and v == "":
        logger.info("validate_file_input: returning None (v is empty string)")
        return None
    if isinstance(v, list):
        # Filter out empty strings and non-UploadFile objects
        result = [item for item in v if hasattr(item, 'filename') and item.filename]
        logger.info(f"validate_file_input: returning list with {len(result)} items: {result}")
        return result
    if hasattr(v, 'filename') and v.filename:
        logger.info(f"validate_file_input: returning UploadFile: {v.filename}")
        return v
    
    logger.info("validate_file_input: returning None (no conditions matched)")
    return None

@router.post(
    "/",
    response_model=ProductDetail,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
    summary="Create new product",
    responses={
        400: {"description": "Invalid category or data"},
        409: {"description": "Product name already exists"}
    }
)
async def create_product(
    name: Annotated[str, Form(min_length=2, max_length=100, example="Wireless Mouse")],
    price: Annotated[Decimal, Form(gt=0, example=23.99)],
    category_id: Annotated[str, Form()] = "",  # Accept as string to handle empty values
    stock_quantity: Annotated[Optional[int], Form()] = 0,
    description: Annotated[Optional[str], Form(max_length=500)] = None,
    regular_price: Annotated[Optional[Decimal], Form(gt=0)] = None,
    sale_price: Annotated[Optional[Decimal], Form(gt=0)] = None,
    primary_image: Union[UploadFile, str, None] = File(None),
    secondary_images: Union[List[UploadFile], str, None] = File([]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        # Parse category_id from string to int or None
        parsed_category_id = None
        if category_id and category_id.strip() and category_id.strip() != "":
            try:
                parsed_category_id = int(category_id.strip())
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid category_id format"
                )
            
        # Apply custom validation
        processed_primary_image = validate_file_input(primary_image)
        processed_secondary_images = validate_file_input(secondary_images)
        
        # Debug logging
        logger.info(f"Raw primary_image: {type(primary_image)} - {primary_image}")
        logger.info(f"Raw secondary_images: {type(secondary_images)} - {secondary_images}")
        logger.info(f"Processed primary_image: {type(processed_primary_image)} - {processed_primary_image}")
        logger.info(f"Processed secondary_images: {type(processed_secondary_images)} - {processed_secondary_images}")
        
        # Create product data
        product_data = ProductCreate(
            name=name,
            price=price,
            category_id=parsed_category_id,
            stock_quantity=stock_quantity,
            description=description,
            regular_price=regular_price,
            sale_price=sale_price,
        )
        
        # Use your existing CRUD logic
        product = await product_crud.create_product_with_images(
            db=db,
            product_data=product_data,
            primary_image=processed_primary_image,
            secondary_images=processed_secondary_images
        )
        
        return product
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating product: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put(
    "/{product_id}",
    response_model=ProductDetail,
    dependencies=[Depends(require_admin)],
    summary="Update product",
    responses={
        400: {"description": "Invalid input"},
        404: {"description": "Product not found"}
    }
)
async def update_product(
    product_id: int = Path(..., gt=0, description="Product ID to update"),
    name: Annotated[Optional[str], Form(min_length=2, max_length=100)] = None,
    description: Annotated[Optional[str], Form(max_length=500)] = None,
    price: Annotated[Optional[Decimal], Form(gt=0)] = None,
    stock_quantity: Annotated[Optional[int], Form(ge=0)] = None,
    category_id: Annotated[Optional[int], Form()] = None,
    regular_price: Annotated[Optional[Decimal], Form(gt=0)] = None,
    sale_price: Annotated[Optional[Decimal], Form(gt=0)] = None,
    primary_image: Union[UploadFile, str, None] = File(None),
    keep_image_ids: Annotated[Optional[str], Form()] = None,
    new_images: Union[List[UploadFile], str, None] = File([]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update product details and images."""
    
    # Convert string inputs to None/valid files
    if isinstance(primary_image, str):
        primary_image = None
    new_images = [f for f in new_images if not isinstance(f, str)]
    
    # Validate images
    primary_image = await ImageService.validate_image(primary_image)
    new_images = [
        img for img in 
        [await ImageService.validate_image(img) for img in new_images]
        if img is not None
    ]

    try:
        # Prepare product data
        product_data = ProductUpdate(
            name=name.strip() if name else None,
            description=description.strip() if description else None,
            price=price,
            stock_quantity=stock_quantity,
            category_id=category_id,
            regular_price=regular_price,
            sale_price=sale_price,
        )

        # Prepare image data
        image_update = None
        if keep_image_ids is not None or new_images:
            keep_ids = []
            if keep_image_ids:
                keep_ids = [int(id.strip()) for id in keep_image_ids.split(",") if id.strip().isdigit()]
            
            image_update = ProductImageUpdate(
                keep_ids=keep_ids,
                new_images=new_images
            )

        return await product_crud.update_product_with_images(
            db,
            product_id=product_id,
            product_data=product_data,
            image_data=image_update,
            new_primary_image=primary_image
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Product update failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
    responses={
        404: {"description": "Product not found"},
        500: {"description": "Product deletion failed"}
    }
)
async def delete_product(
    product_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete product and associated images folder."""
    product = product_crud.get(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    
    product_crud.remove(db, id=product_id)
    
    try:
        await ImageService.delete_product_folder(product_id)
    except Exception as e:
        logger.error(f"Error deleting product folder for product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete product folder: {str(e)}"
        )
    
    return None