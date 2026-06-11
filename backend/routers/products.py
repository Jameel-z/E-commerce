# backend/routers/product.py
from fastapi import (
    APIRouter, Depends, HTTPException, Query, status, Path,
    UploadFile, File, Form, Body
)
from fastapi.encoders import jsonable_encoder
from typing import List, Optional, Annotated, Union
from decimal import Decimal
from sqlalchemy.orm import Session
from database import get_db
from core.cache import cache_get, cache_set, cache_delete, cache_delete_pattern

def _invalidate_product_cache():
    cache_delete("products:featured")
    cache_delete_pattern("products:list:*")
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
from pydantic import BaseModel as PydanticBaseModel
import logging

class FeaturedToggle(PydanticBaseModel):
    is_featured: bool
    featured_order: int = 0

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
    parent_category_id: Optional[int] = Query(None, description="Filter by parent category ID (includes child categories)"),
    search: Optional[str] = Query(None, description="Search term")
):
    """Get paginated products with optional filters."""
    cache_key = f"products:list:{page}:{per_page}:{category_id}:{parent_category_id}:{search}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached
    result = product_crud.get_list(
        db,
        skip=(page - 1) * per_page,
        limit=per_page,
        category_id=category_id,
        parent_category_id=parent_category_id,
        search_term=search
    )
    data = jsonable_encoder(result)
    cache_set(cache_key, data, ttl=120)
    return data

@router.get(
    "/featured",
    response_model=List[ProductList],
    summary="Get Featured Products",
)
def get_featured_products(db: Session = Depends(get_db)):
    """Return products marked as featured, ordered by featured_order."""
    cached = cache_get("products:featured")
    if cached is not None:
        return cached
    from models.product import Product
    result = (
        db.query(Product)
        .filter(Product.is_featured == True)
        .order_by(Product.featured_order)
        .all()
    )
    data = jsonable_encoder(result)
    cache_set("products:featured", data, ttl=300)
    return data

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

@router.get(
    "/feed/meta",
    summary="Meta Catalog Product Feed",
    description="Returns products in Meta Catalog format for Facebook/Instagram Shopping"
)
def get_meta_product_feed(
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """
    Product feed endpoint for Meta Catalog data source integration.
    Returns products formatted for Facebook/Instagram Shopping ads.
    """
    try:
        from models.product import Product as ProductModel
        from sqlalchemy.orm import joinedload

        # Get products with relationships eager loaded
        products = (
            db.query(ProductModel)
            .options(
                joinedload(ProductModel.images),
                joinedload(ProductModel.category)
            )
            .filter(ProductModel.is_active == True)
            .order_by(ProductModel.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        feed_items = []
        for product in products:
            try:
                # Use sale price if available, otherwise regular price
                price = float(product.sale_price or product.regular_price or product.price)

                # Determine availability
                availability = "in stock" if product.stock_quantity > 0 else "out of stock"

                # Get primary image URL
                image_url = ""
                if product.images and len(product.images) > 0:
                    image_url = product.images[0].url or ""

                # Get category name
                category_name = "Uncategorized"
                if product.category:
                    category_name = product.category.name

                feed_item = {
                    "id": str(product.id),
                    "title": product.name,
                    "description": product.description or "",
                    "price": f"{price:.2f} USD",
                    "image_url": image_url,
                    "url": f"https://961shop.com/products/{product.id}",
                    "availability": availability,
                    "category": category_name,
                    "brand": product.brand or "",
                    "sku": product.sku or "",
                    "condition": product.condition or "new"
                }
                feed_items.append(feed_item)
            except Exception as e:
                logger.error(f"Error processing product {product.id}: {str(e)}")
                continue

        return {
            "products": feed_items,
            "total_count": len(feed_items),
            "offset": offset,
            "limit": limit
        }
    except Exception as e:
        logger.error(f"Error in Meta product feed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --------------------------
# ADMIN-ONLY ENDPOINTS
# --------------------------

# Custom validator function
def validate_file_input(v):
    """Handle different file input types"""
    if v is None:
        return None
    if isinstance(v, str) and v == "":
        return None
    if isinstance(v, list):
        return [item for item in v if hasattr(item, 'filename') and item.filename]
    if hasattr(v, 'filename') and v.filename:
        return v
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
    name: Annotated[str, Form(min_length=2, max_length=255, example="Wireless Mouse")],
    price: Annotated[Decimal, Form(gt=0, example=23.99)],
    category_id: Annotated[str, Form()] = "",  # Accept as string to handle empty values
    stock_quantity: Annotated[Optional[int], Form()] = 0,
    description: Annotated[Optional[str], Form(max_length=5000)] = None,
    full_description: Annotated[Optional[str], Form()] = None,
    sku: Annotated[Optional[str], Form(max_length=100)] = None,
    brand: Annotated[Optional[str], Form(max_length=100)] = None,
    tags: Annotated[Optional[str], Form(max_length=500)] = None,
    condition: Annotated[Optional[str], Form(max_length=100)] = None,
    shipping: Annotated[Optional[str], Form(max_length=200)] = None,
    vat: Annotated[Optional[str], Form(max_length=100)] = None,
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

        # Create product data
        product_data = ProductCreate(
            name=name,
            price=price,
            category_id=parsed_category_id,
            stock_quantity=stock_quantity,
            description=description,
            full_description=full_description,
            sku=sku or None,
            brand=brand or None,
            tags=tags or None,
            condition=condition or None,
            shipping=shipping or None,
            vat=vat or None,
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
        _invalidate_product_cache()
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
    name: Annotated[Optional[str], Form(min_length=2, max_length=255)] = None,
    description: Annotated[Optional[str], Form(max_length=5000)] = None,
    full_description: Annotated[Optional[str], Form()] = None,
    sku: Annotated[Optional[str], Form(max_length=100)] = None,
    brand: Annotated[Optional[str], Form(max_length=100)] = None,
    tags: Annotated[Optional[str], Form(max_length=500)] = None,
    condition: Annotated[Optional[str], Form(max_length=100)] = None,
    shipping: Annotated[Optional[str], Form(max_length=200)] = None,
    vat: Annotated[Optional[str], Form(max_length=100)] = None,
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
            full_description=full_description,
            sku=sku or None,
            brand=brand or None,
            tags=tags or None,
            condition=condition or None,
            shipping=shipping or None,
            vat=vat or None,
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

        result = await product_crud.update_product_with_images(
            db,
            product_id=product_id,
            product_data=product_data,
            image_data=image_update,
            new_primary_image=primary_image
        )
        _invalidate_product_cache()
        return result

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
    _invalidate_product_cache()

    try:
        await ImageService.delete_product_folder(product_id)
    except Exception as e:
        logger.error(f"Error deleting product folder for product {product_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete product folder: {str(e)}"
        )

    return None

@router.patch(
    "/{product_id}/featured",
    response_model=ProductDetail,
    dependencies=[Depends(require_admin)],
    summary="Toggle product featured status",
)
def set_product_featured(
    product_id: int = Path(..., gt=0),
    payload: FeaturedToggle = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from models.product import Product
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_featured = payload.is_featured
    product.featured_order = payload.featured_order
    db.commit()
    db.refresh(product)
    _invalidate_product_cache()
    return product