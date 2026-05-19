from sqlalchemy.orm import Session, joinedload, aliased
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
from sqlalchemy import func, Integer, case, or_

logger = logging.getLogger(__name__)

class ProductCRUD(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def get_list(
            self,
            db: Session,
            skip: int = 0,
            limit: int = 100,
            category_id: Optional[int] = None,
            parent_category_id: Optional[int] = None,
            search_term: Optional[str] = None
    ):
        """Get products for main page listing with optional category filter"""
        # Computed is_on_sale: True when both regular_price and sale_price exist and sale < regular
        is_on_sale_expr = case(
            (
                (Product.regular_price.isnot(None)) & 
                (Product.sale_price.isnot(None)) & 
                (Product.sale_price < Product.regular_price),
                True
            ),
            else_=False
        ).label('is_on_sale')
        
        # Computed discount_percentage: only when on sale
        discount_percentage_expr = case(
            (
                (Product.regular_price.isnot(None)) & 
                (Product.sale_price.isnot(None)) & 
                (Product.sale_price < Product.regular_price),
                func.cast(
                    func.round((1 - Product.sale_price / Product.regular_price) * 100),
                    Integer
                )
            ),
            else_=None
        ).label('discount_percentage')
        
        ParentCategory = aliased(Category)

        query = (
            db.query(
                Product.id,
                Product.name,
                Product.price,
                Product.primary_image_url,
                Product.description,
                func.coalesce(Category.name, "Uncategorized").label('category_name'),
                Product.stock_quantity,
                Product.regular_price,
                Product.sale_price,
                Product.created_at,
                is_on_sale_expr,
                discount_percentage_expr
            )
            .outerjoin(Product.category)
            .outerjoin(ParentCategory, Category.parent_id == ParentCategory.id)
        )

        if category_id:
            query = query.filter(Product.category_id == category_id)

        if parent_category_id:
            child_ids = [
                row[0] for row in
                db.query(Category.id).filter(Category.parent_id == parent_category_id).all()
            ]
            all_ids = [parent_category_id] + child_ids
            query = query.filter(Product.category_id.in_(all_ids))

        if search_term:
            # Remove hyphens so "wifi" matches "Wi-Fi"
            words = [w.replace("-", "") for w in search_term.split() if w.replace("-", "")]
            for word in words:
                # Exact substring match (fast via GIN index)
                exact = or_(
                    func.replace(Product.name, "-", "").ilike(f"%{word}%"),
                    func.replace(Product.description, "-", "").ilike(f"%{word}%"),
                    func.replace(Category.name, "-", "").ilike(f"%{word}%"),
                    func.replace(ParentCategory.name, "-", "").ilike(f"%{word}%"),
                )
                # Fuzzy match via pg_trgm — handles typos like "dahwa" → "dahua"
                # Only applied for words >= 4 chars to avoid false positives
                if len(word) >= 4:
                    fuzzy = or_(
                        func.word_similarity(word, func.replace(Product.name, "-", "")) >= 0.35,
                        func.word_similarity(word, func.replace(Category.name, "-", "")) >= 0.4,
                        func.word_similarity(word, func.replace(ParentCategory.name, "-", "")) >= 0.4,
                    )
                    query = query.filter(exact | fuzzy)
                else:
                    query = query.filter(exact)

        # Newest products first
        query = query.order_by(Product.created_at.desc())

        results = query.offset(skip).limit(limit).all()
        return [row._asdict() for row in results]

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
        
        # Sync price with sale_price if on sale
        if product_data.sale_price is not None and product_data.regular_price is not None:
            product_data.price = product_data.sale_price
        elif product_data.regular_price is not None:
            product_data.price = product_data.regular_price

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
            
            # Sync price with sale_price if on sale
            if "sale_price" in update_data and "regular_price" in update_data:
                if update_data["sale_price"] is not None and update_data["regular_price"] is not None:
                    update_data["price"] = update_data["sale_price"]
            elif "regular_price" in update_data and "sale_price" not in update_data:
                if update_data["regular_price"] is not None:
                    update_data["price"] = update_data["regular_price"]
            
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