from sqlalchemy import and_
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status, Request, Response
from typing import Optional, List
from datetime import datetime, timezone
from uuid import uuid4
import logging

import models, schemas
from .base_crud import CRUDBase

logger = logging.getLogger(__name__)

class CartCRUD(CRUDBase[models.Cart, schemas.CartCreate, schemas.CartUpdate]):
    def get_or_create_cart(self, db: Session, user_id: int = None, cart_id: str = None) -> models.Cart:
        """Retrieve or create a cart for a user or guest with efficient query"""
        # Check for existing cart
        query = db.query(models.Cart)
        if user_id:
            cart = query.filter(models.Cart.user_id == user_id).first()
        elif cart_id:
            cart = query.filter(models.Cart.cart_id == cart_id).first()
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either user_id or cart_id must be provided."
            )

        # Create new cart if not found
        if not cart:
            cart = models.Cart(
                user_id=user_id,
                cart_id=cart_id or str(uuid4()),
                created_at=datetime.now(timezone.utc),
            )
            db.add(cart)
            try:
                db.commit()
                db.refresh(cart)
            except SQLAlchemyError as e:
                db.rollback()
                logger.error(f"Failed to create cart: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create cart"
                )

        return cart
    
    def get_cart_by_cart_id(self, db: Session, cart_id: str) -> Optional[models.Cart]:
        """Get cart by cart_id (guest identifier)"""
        return db.query(models.Cart).filter(models.Cart.cart_id == cart_id).first()
    
    def get_cart_for_user_or_guest(
        self,
        request: Request,
        response: Response,
        db: Session,
        current_user: Optional[models.User] = None  # Now truly optional
    ) -> models.Cart:
        """Retrieve or create a cart for a user or guest."""
        if current_user:
            return self.get_or_create_cart(db, user_id=current_user.id)

        guest_cart_id = request.cookies.get("guest_cart_id")
        if guest_cart_id:
            cart = self.get_cart_by_cart_id(db, guest_cart_id)
            if cart:
                return cart
        
        # Create new guest cart
        guest_cart_id = str(uuid4())
        cart = self.get_or_create_cart(db, cart_id=guest_cart_id)
        response.set_cookie(
            key="guest_cart_id",
            value=guest_cart_id,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=30 * 24 * 60 * 60,  # 30 days
        )
        return cart

    def update_cart_total(self, db: Session, cart: models.Cart):
        """Recalculate and update the total price of the cart efficiently"""
        try:
            total = 0.0
            for item in cart.items:
                # Use locked price if available, otherwise fall back to current product price
                price = item.price_at_addition
                if price is None and item.product and item.product.price is not None:
                    try:
                        price = float(item.product.price)
                    except (ValueError, TypeError):
                        logger.warning(f"Error converting price for product {item.product.id}, skipping")
                        continue
                
                if price is not None:
                    try:
                        quantity = item.quantity or 0
                        if not isinstance(price, (int, float)) or price < 0:
                            logger.warning(f"Skipping invalid price {price} for cart item {item.id}")
                            continue
                        if not isinstance(quantity, int) or quantity < 0:
                            logger.warning(f"Skipping invalid quantity {quantity} for cart item {item.id}")
                            continue
                        total += price * quantity
                    except (ValueError, TypeError):
                        logger.warning(f"Error converting price for product {item.product.id}, skipping")
                        continue
                else:
                    logger.warning(f"Item {item.id} has no product or price")
            cart.total_price = round(total, 2)
            cart.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(cart)
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Failed to update cart total: {str(e)}")
            cart.total_price = 0.0  # Fallback
            db.commit()

    def add_item_to_cart(self, db: Session, cart: models.Cart, item: schemas.CartItemCreate):
        """Add or update an item in the cart with atomic operations"""
        try:
            # Lock product row for update
            product = db.query(models.Product).filter(
                models.Product.id == item.product_id
            ).with_for_update().first()

            if not product:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Product not found."
                )

            # Calculate available stock (total - reserved for pending orders)
            available_stock = product.stock_quantity - (product.reserved_quantity or 0)
            
            if available_stock <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Product is currently unavailable."
                )

            if item.quantity > available_stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Only {available_stock} items available in stock."
                )

            # Determine current selling price (sale_price if on sale, otherwise price)
            current_price = float(product.sale_price if product.is_on_sale else product.price)

            cart_item = db.query(models.CartItem).filter(
                and_(
                    models.CartItem.cart_id == cart.id,
                    models.CartItem.product_id == item.product_id,
                )
            ).first()

            if cart_item:
                new_quantity = cart_item.quantity + item.quantity
                if new_quantity > available_stock:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Cannot add {item.quantity} items. Only {available_stock - cart_item.quantity} more available."
                    )
                cart_item.quantity = new_quantity
                # Update locked price if it was null (legacy data)
                if cart_item.price_at_addition is None:
                    cart_item.price_at_addition = current_price
            else:
                cart_item = models.CartItem(
                    cart_id=cart.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    price_at_addition=current_price  # Lock price at time of addition
                )
                db.add(cart_item)
                db.commit()

            db.commit()
            self.update_cart_total(db, cart)
            return cart
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Failed to add item to cart: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add item to cart"
            )
    
    def remove_item_from_cart(self, db: Session, cart: models.Cart, product_id: int):
        """Remove an item from the cart"""
        try:
            cart_item = db.query(models.CartItem).filter(
                and_(
                    models.CartItem.cart_id == cart.id,
                    models.CartItem.product_id == product_id
                )
            ).first()

            if not cart_item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Item not found in cart."
                )

            db.delete(cart_item)
            db.commit()
            self.update_cart_total(db, cart)
            return cart
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Failed to remove item from cart: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to remove item from cart"
            )

    def clear_cart(self, db: Session, cart: models.Cart):
        """Remove all items from cart efficiently"""
        try:
            db.query(models.CartItem).filter(
                models.CartItem.cart_id == cart.id ).delete(synchronize_session=False)
            
            db.commit()
            # Update the cart's in-memory items list and total
            cart.items.clear()
            cart.total_price = 0
            cart.updated_at = datetime.now(timezone.utc)
            db.commit()
            return cart
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Failed to clear cart: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to clear cart"
            )

    def get_cart_item(self, db: Session, cart: models.Cart, product_id: int):
        """Retrieve a specific item in the cart with product details"""
        return db.query(models.CartItem).options(
            joinedload(models.CartItem.product)
        ).filter(
            and_(
                models.CartItem.cart_id == cart.id,
                models.CartItem.product_id == product_id
            )
        ).first()

    def merge_carts(self, db: Session, user_cart: models.Cart, guest_cart: models.Cart):
        """Merge guest cart into user cart after login"""
        if user_cart.id == guest_cart.id:
            return user_cart
            
        try:
            # Move items to user cart
            for guest_item in guest_cart.items:
                # Check if item exists in user cart
                existing_item = db.query(models.CartItem).filter(
                    and_(
                        models.CartItem.cart_id == user_cart.id,
                        models.CartItem.product_id == guest_item.product_id
                    )
                ).first()
                
                if existing_item:
                    # Combine quantities
                    new_quantity = existing_item.quantity + guest_item.quantity
                    
                    # Check stock availability
                    product = guest_item.product
                    if new_quantity > product.stock_quantity:
                        # Cap at max available stock
                        existing_item.quantity = product.stock_quantity
                    else:
                        existing_item.quantity = new_quantity
                else:
                    # Transfer item to user cart
                    guest_item.cart_id = user_cart.id
            
            # Delete guest cart
            db.delete(guest_cart)
            db.commit()
            
            # Update cart total
            self.update_cart_total(db, user_cart)
            return user_cart
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Cart merge failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to merge carts"
            )

    def merge_guest_cart_data(self, db: Session, user_cart: models.Cart, guest_items: List[schemas.GuestCartItemRequest]):
        """
        Merge guest cart items (from frontend localStorage) into user cart
        
        Args:
            db: Database session
            user_cart: User's existing cart
            guest_items: List of guest cart items from frontend
        
        Returns:
            Updated user cart with merged items
        """
        try:
            # Process each guest cart item
            for guest_item in guest_items:
                # Validate product exists and get stock info
                product = db.query(models.Product).filter(
                    models.Product.id == guest_item.product_id
                ).first()
                
                if not product or product.stock_quantity <= 0:
                    # Skip unavailable products (graceful handling)
                    logger.warning(f"Skipping unavailable product {guest_item.product_id}")
                    continue
                
                # Check if item already exists in user cart
                existing_item = db.query(models.CartItem).filter(
                    and_(
                        models.CartItem.cart_id == user_cart.id,
                        models.CartItem.product_id == guest_item.product_id
                    )
                ).first()
                
                if existing_item:
                    # Combine quantities with stock validation
                    new_quantity = existing_item.quantity + guest_item.quantity
                    if new_quantity > product.stock_quantity:
                        # Cap at max available stock (same logic as your other methods)
                        existing_item.quantity = product.stock_quantity
                        logger.info(f"Capped quantity for product {guest_item.product_id} at stock limit")
                    else:
                        existing_item.quantity = new_quantity
                    
                    existing_item.updated_at = datetime.now(timezone.utc)
                else:
                    # Add new item to cart (same pattern as add_item_to_cart)
                    max_quantity = min(guest_item.quantity, product.stock_quantity)
                    new_cart_item = models.CartItem(
                        cart_id=user_cart.id,
                        product_id=guest_item.product_id,
                        quantity=max_quantity,
                        added_at=datetime.now(timezone.utc)
                    )
                    db.add(new_cart_item)
            
            # Commit all changes
            db.commit()
            
            # Update cart total (using your existing method)
            self.update_cart_total(db, user_cart)
            
            # Refresh cart to get latest data
            db.refresh(user_cart)
            
            return user_cart
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Failed to merge guest cart data: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to merge cart data"
            )

    def update_item_quantity(self, db: Session, cart: models.Cart, product_id: int, quantity: int):
        """Update the quantity of an item in the cart"""
        try:
            if quantity <= 0:
                raise HTTPException(status_code=400, detail="Quantity must be greater than 0.")
            
            cart_item = db.query(models.CartItem).filter(
                models.CartItem.cart_id == cart.id,
                models.CartItem.product_id == product_id
            ).first()
            
            if not cart_item:
                raise HTTPException(status_code=404, detail="Item not found in cart.")
            
            # Removed stock check - allow unlimited quantities
            cart_item.quantity = quantity
            db.commit()
            self.update_cart_total(db, cart)
            return cart
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Failed to update item quantity: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to update item quantity")

cart_crud = CartCRUD(models.Cart)