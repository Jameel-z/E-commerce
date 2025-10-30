from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from .base_crud import CRUDBase
from .category_crud import category_crud
from models.product import Product, ProductImage
from models.category import Category
from schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductImageUpdate,
    ProductDetail
)
from fastapi import UploadFile
import logging
from services.image_services import ImageService
from core.utils import generate_static_url
# import func
from sqlalchemy import func

logger = logging.getLogger(__name__)

class ProductCRUD(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def get_list(
            self,
            db: Session,
            skip: int = 0,
            limit: int = 100,
            category_id: Optional[int] = None,
            search_term: Optional[str] = None
    ):
        """Get products for main page listing with optional category filter"""
        query = (
            db.query(
                Product.id,
                Product.name,
                Product.price,
                Product.primary_image_url,
                Product.description,
                func.coalesce(Category.name, "Uncategorized").label('category_name'),
                Product.stock_quantity
            )
            .outerjoin(Product.category)  # Change from .join() to .outerjoin() to include products without categories
        )

        if category_id:
            query = query.filter(Product.category_id == category_id)

        if search_term:
            query = query.filter(
                Product.name.ilike(f"%{search_term}%") |
                Product.description.ilike(f"%{search_term}%")  # Fixed missing %
                )

        return query.offset(skip).limit(limit).all()

    def get_by_name(self, db: Session, *, name: str) -> Optional[Product]:
        """Get product by exact name match"""
        return db.query(self.model).filter(self.model.name == name).first()
    
    def get_detail(
        self,
        db: Session,
        product_id: int
    ) -> Optional[ProductDetail]:
        """Get detailed product information including category and images"""
        return (
            db.query(Product)
            .filter(Product.id == product_id)
            .options(
                joinedload(Product.category),
                joinedload(Product.images)
            )
            .first()
        )
    
    async def create_product_with_images(
        self,
        db: Session,
        *,
        product_data: ProductCreate,
        primary_image: Optional[UploadFile] = None,
        secondary_images: List[UploadFile] = []
    ) -> ProductDetail:
        """Create a new product with primary and secondary images"""
        # Validate inputs
        if self.get_by_name(db, name=product_data.name):
            raise ValueError(f"Product with name '{product_data.name}' already exists")
        
        # Only validate category if category_id is provided
        if product_data.category_id is not None:
            if not category_crud.get(db, product_data.category_id):
                raise ValueError(f"Category with ID {product_data.category_id} doesn't exist")

        relative_path = None
        uploaded_paths = []
        try:
            # Create product first
            product = self.create(db, obj_in=product_data)
            logger.info(f"Created product with ID: {product.id}")
            
            # Handle primary image
            logger.info(f"Processing primary_image: {type(primary_image)} - {primary_image}")
            if primary_image:
                logger.info(f"Saving primary image for product {product.id}")
                relative_path = await ImageService.save_product_image(primary_image, product.id)
                uploaded_paths.append(relative_path)
                product.primary_image_url = generate_static_url(relative_path)
                logger.info(f"Primary image saved: {relative_path}")
            else:
                logger.info("No primary image to process")
            
            # Handle secondary images
            logger.info(f"Processing secondary_images: {type(secondary_images)} - count: {len(secondary_images) if secondary_images else 0}")
            for i, image in enumerate(secondary_images):
                logger.info(f"Saving secondary image {i+1} for product {product.id}")
                relative_path = await ImageService.save_product_image(image, product.id)
                uploaded_paths.append(relative_path)
                db_image = ProductImage(
                    url=generate_static_url(relative_path),
                    product_id=product.id
                )
                db.add(db_image)
            
            db.commit()
            return self.get_detail(db, product.id)
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create product: {str(e)}")
            # Cleanup uploaded files if creation failed
            for p in uploaded_paths:
                try:
                    ImageService.delete_image(p)
                except Exception:
                    logger.warning(f"Failed to cleanup image {p}")
            raise
    
    async def update_product_with_images(
        self,
        db: Session,
        *,
        product_id: int,
        product_data: ProductUpdate,
        image_data: Optional[ProductImageUpdate] = None,
        new_primary_image: Optional[UploadFile] = None
    ) -> ProductDetail:
        db_product = self.get(db, product_id)
        if not db_product:
            raise ValueError("Product not found")

        try:
            # Update basic product info
            update_data = product_data.model_dump(exclude_unset=True)
            if update_data:
                for field, value in update_data.items():
                    setattr(db_product, field, value)
                db.add(db_product)

            # Handle primary image
            old_primary_url = None
            if new_primary_image:
                old_primary_url = db_product.primary_image_url
                rel = await ImageService.save_product_image(new_primary_image, product_id)
                db_product.primary_image_url = generate_static_url(rel)
                db.add(db_product)

            # Handle secondary images
            if image_data:
                current_images = {img.id: img for img in db_product.images}
                
                # Delete images not in keep_ids
                for img_id, img in current_images.items():
                    if img_id not in image_data.keep_ids:
                        try:
                            ImageService.delete_image(img.url)
                        except Exception:
                            logger.warning(f"Failed to delete image {img.url}")
                        db.delete(img)
                
                # Add new images
                for image_file in image_data.new_images:
                    rel = await ImageService.save_product_image(image_file, product_id)
                    db.add(ProductImage(url=generate_static_url(rel), product_id=product_id))

            db.commit()
            
            # Cleanup old files after successful commit (fire-and-forget)
            if old_primary_url:
                try:
                    ImageService.delete_image(old_primary_url)
                except Exception:
                    logger.warning(f"Failed to delete old primary image {old_primary_url}")

            return self.get_detail(db, product_id)
        
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update product {product_id}: {str(e)}", exc_info=True)
            raise
  
product_crud = ProductCRUD(Product)