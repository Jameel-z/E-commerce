from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import logging

from database import get_db
from core.security import get_current_active_user, require_admin
import models, schemas, crud

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    responses={
        404: {"description": "Order not found"},
        400: {"description": "Invalid request data"},
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden - Admin only"},
        500: {"description": "Internal server error"}
    }
)


@router.post("/create", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    cart_id: int,
    notes: Optional[str] = None,
    order_method: str = "online",
    payment_method: Optional[str] = None,
    customer_name: Optional[str] = None,
    customer_phone: Optional[str] = None,
    shipping_address: Optional[str] = None,
    shipping_city: Optional[str] = None,
    shipping_area: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Create order from user's cart.
    
    - Validates cart belongs to user
    - Creates order with items from cart
    - Reserves stock automatically
    - Clears cart after successful order creation
    - Supports both online and WhatsApp orders
    - Captures shipping information
    
    **order_method**: "online" or "whatsapp" (default: "online")
    **payment_method**: "cash", "visa", "pickup", etc. (optional)
    **customer_name**: Full name for delivery
    **customer_phone**: Contact phone number
    **shipping_address**: Full street address
    **shipping_city**: City name
    **shipping_area**: Area/district name
    """
    # Get user's cart with items
    cart = db.query(models.Cart).options(
        joinedload(models.Cart.items).joinedload(models.CartItem.product)
    ).filter(
        models.Cart.id == cart_id,
        models.Cart.user_id == current_user.id
    ).first()
    
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found or doesn't belong to you"
        )
    
    if not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty. Add items before creating order."
        )
    
    # Build order items from cart
    order_items = []
    for cart_item in cart.items:
        if not cart_item.product:
            logger.warning(f"Cart item {cart_item.id} has no product, skipping")
            continue
            
        # Use locked price from cart if available, else current product price
        price = cart_item.price_at_addition
        if price is None:
            price = float(cart_item.product.sale_price if cart_item.product.is_on_sale 
                         else cart_item.product.price)
        
        order_items.append(
            schemas.OrderItemCreate(
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                price_at_order=price
            )
        )
    
    if not order_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid items in cart"
        )
    
    # Create order (this reserves stock automatically)
    order_create = schemas.OrderCreate(
        user_id=current_user.id,
        order_items=order_items,
        notes=notes,
        status="pending",
        order_method=order_method,
        payment_method=payment_method,
        customer_name=customer_name,
        customer_phone=customer_phone,
        shipping_address=shipping_address,
        shipping_city=shipping_city,
        shipping_area=shipping_area
    )
    
    try:
        order = crud.order_crud.create_with_items(
            db=db,
            obj_in=order_create,
            user_id=current_user.id
        )
        
        # Clear cart after successful order
        crud.cart_crud.clear_cart(db, cart)
        
        logger.info(f"Order {order.id} created for user {current_user.id}")
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order"
        )


@router.get("/my-orders", response_model=List[schemas.Order])
async def get_my_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Get all orders for the current user.
    
    Returns orders sorted by creation date (newest first).
    """
    orders = db.query(models.Order).options(
        joinedload(models.Order.order_items)
    ).filter(
        models.Order.user_id == current_user.id
    ).order_by(
        models.Order.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return orders


@router.get("/{order_id}", response_model=schemas.OrderWithItems)
async def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Get detailed information about a specific order.
    
    Includes all order items with product details.
    Users can only view their own orders.
    """
    order = db.query(models.Order).options(
        joinedload(models.Order.order_items).joinedload(models.OrderItem.product)
    ).filter(
        models.Order.id == order_id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Users can only view their own orders (admins can view all)
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this order"
        )
    
    return order


@router.patch("/{order_id}/status", response_model=schemas.Order)
async def update_order_status(
    order_id: int,
    status_update: schemas.OrderUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """
    Update order status (Admin only).
    
    Status transitions:
    - pending → processing/cancelled
    - processing → shipped/cancelled  
    - shipped → delivered
    
    Stock management:
    - cancelled: Releases reserved stock
    - processing (from pending): Confirms stock deduction
    """
    # Get order with items
    order = db.query(models.Order).options(
        joinedload(models.Order.order_items)
    ).filter(
        models.Order.id == order_id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if not status_update.status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status is required"
        )
    
    # Use the CRUD method that handles stock management
    try:
        updated_order = crud.order_crud.update_order_status(
            db=db,
            order_id=order_id,
            new_status=status_update.status,
            order_items=order.order_items
        )
        
        logger.info(f"Order {order_id} status updated to {status_update.status} by admin {current_user.id}")
        return updated_order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update order status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order status"
        )


@router.get("/", response_model=List[schemas.Order])
async def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """
    Get all orders (Admin only).
    
    Optional filtering by status.
    Returns orders sorted by creation date (newest first).
    """
    query = db.query(models.Order).order_by(models.Order.created_at.desc())
    
    if status_filter:
        query = query.filter(models.Order.status == status_filter)
    
    orders = query.offset(skip).limit(limit).all()
    return orders
