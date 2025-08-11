from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from .base_crud import CRUDBase
from .category_crud import category_crud
from models.product import Product, ProductImage
from models.category import Category
from schemas.product import (
    ProductList,
    ProductCreate,
    ProductUpdate,
    ProductImageCreate,
    ProductImage as ProductImageSchema,
    ProductDetail
)
# import UploadFile
from fastapi import UploadFile, File


class ProductCRUD(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def get_list(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        category_id: Optional[int] = None,
    ) -> List[ProductList]:
        """Get products for main page listing with optional category filter"""
        query = (
            db.query(
                Product.id,
                Product.name,
                Product.price,
                Product.primary_image_url,
                Category.name.label('category_name')
            )
            .join(Product.category)
        )

        if category_id:
            query = query.filter(Product.category_id == category_id)

        return query.offset(skip).limit(limit).all()

    def get_by_name(self, db: Session, *, name: str) -> Optional[Product]:
        """Get product by exact name match"""
        return db.query(self.model).filter(self.model.name == name).first()
    
    def update_stock(
        self,
        db: Session,
        *,
        db_obj: Product,
        stock_adjustment: int
    ) -> Product:
        """Update product stock quantity with validation"""
        if db_obj.stock_quantity + stock_adjustment < 0:
            raise ValueError("Insufficient stock available")
        
        db_obj.stock_quantity += stock_adjustment
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_in_stock(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """Return products with stock_quantity > 0"""
        return (
            db.query(self.model)
            .filter(self.model.stock_quantity > 0)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_out_of_stock(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """Return products with stock_quantity == 0"""
        return (
            db.query(self.model)
            .filter(self.model.stock_quantity == 0)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_category(
        self,
        db: Session,
        category_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """Return products filtered by category_id"""
        return (
            db.query(self.model)
            .filter(self.model.category_id == category_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
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
            product_data: ProductCreate,
            primary_image: Optional[UploadFile] = None,
            secondary_images: List[UploadFile] = []
    ) -> ProductDetail:
        """Create a new product with primary and secondary images"""
        # check for existing product name
        if self.get_by_name(db, name=product_data.name):
            raise ValueError(f"Product with name '{product_data.name}")
        # validate category
        if not category_crud.get(db, product_data.category_id):
            raise ValueError(f"Category with ID {product_data.category_id} doesnt exist")
        # Create the product
        product = self.create(db, obj_in=product_data)
        
        # Handle primary image
        if primary_image:
            product = self.update_primary_image(
                db, product_id=product.id, image_url=primary_image
            )
        
        # Handle secondary images
        if secondary_images:
            for image in secondary_images:
                self.add_product_image(db, product_id=product.id, image_in=image)
        
        db.commit()
        db.refresh(product)
        
        return self.get_detail(db, product.id)
    
    def add_product_image(
        self,
        db: Session,
        *,
        product_id: int,
        image_in: ProductImageCreate
    ) -> ProductImageSchema:
        """Add a secondary image to a product"""
        db_image = ProductImage(
            url=image_in.url,
            product_id=product_id
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        return db_image
    
    def get_product_images(
        self,
        db: Session,
        *,
        product_id: int
    ) -> List[ProductImageSchema]:
        """Get all secondary images for a product"""
        return (
            db.query(ProductImage)
            .filter(ProductImage.product_id == product_id)
            .all()
        )
    
    def update_primary_image(
        self,
        db: Session,
        *,
        product_id: int,
        image_url: str
    ) -> Product:
        """Update product's primary image URL"""
        db_obj = self.get(db, product_id)
        if not db_obj:
            raise ValueError("Product not found")
            
        db_obj.primary_image_url = image_url
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete_product_image(
        self,
        db: Session,
        *,
        image_id: int
    ) -> None:
        """Delete a secondary image"""
        db_image = db.query(ProductImage).filter(ProductImage.id == image_id).first()
        if db_image:
            db.delete(db_image)
            db.commit()
        else:
            raise ValueError("Image not found")

product_crud = ProductCRUD(Product)