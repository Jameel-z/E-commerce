from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session

import schemas, models, crud
from database import get_db
from core.security import get_current_active_user_optional, get_current_active_user

router = APIRouter(
    prefix="/carts",
    responses={
        404: {"description": "Cart not found"},
        400: {"description": "Invalid request data"},
        401: {"description": "Unauthorized"},
        500: {"description": "Internal server error"}
    }
)


@router.get("/my-cart", response_model=schemas.Cart)
async def get_my_cart(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_active_user_optional),
):
    """Get the current user's or guest's shopping cart with all items."""
    cart = crud.cart_crud.get_cart_for_user_or_guest(request, response, db, current_user)
    crud.cart_crud.update_cart_total(db, cart)
    return cart


@router.post("/add-item", response_model=schemas.Cart)
async def add_to_cart(
    request: Request,
    response: Response,
    item: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_active_user_optional),
):
    """Add an item to the cart or update quantity if item already exists."""
    cart = crud.cart_crud.get_cart_for_user_or_guest(request, response, db, current_user)
    try:
        return crud.cart_crud.add_item_to_cart(db, cart, item)
    except HTTPException as e:
        # Handle specific stock validation errors
        if e.status_code == 400 and "available in stock" in e.detail:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=e.detail
            )
        raise


@router.patch("/update-item", response_model=schemas.Cart)
def update_cart_item(
    request: Request,
    response: Response,
    update_data: schemas.CartUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_active_user_optional),
):
    """
    Update Cart Item

    This endpoint allows you to increment (+) or decrement (-) the quantity of an item in the cart.
    If the quantity reaches 1 and we decrement, the item will be removed from the cart.

    - **action**: Specify "increment" (+) to add one or "decrement" (-) to remove one.
    - **product_id**: The ID of the product to update.

    Returns the updated cart with all items and the total price.
    """
    cart = crud.cart_crud.get_cart_for_user_or_guest(request, response, db, current_user)
    cart_item = crud.cart_crud.get_cart_item(db, cart, update_data.product_id)

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart.")

    # Get product for stock validation
    product = cart_item.product
    
    if update_data.action == "increment":
        # Check stock before incrementing
        if cart_item.quantity >= product.stock_quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot add more than available stock. Only {product.stock_quantity} available."
            )
        cart_item.quantity += 1
    elif update_data.action == "decrement":
        if cart_item.quantity == 1:
            # Remove item if decrementing from 1
            return crud.cart_crud.remove_item_from_cart(
                db, cart, update_data.product_id
            )
        cart_item.quantity -= 1
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'increment' or 'decrement'.")

    db.commit()
    crud.cart_crud.update_cart_total(db, cart)
    return cart

# api to remove an item from the cart using the remove_item_from_cart function
@router.delete("/remove-item/{product_id}", response_model=schemas.Cart)
async def remove_item_from_cart(
    request: Request,
    response: Response,
    product_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_active_user_optional),
):
    """Remove an item from the cart."""
    cart = crud.cart_crud.get_cart_for_user_or_guest(request, response, db, current_user)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found.")
    
    try:
        return crud.cart_crud.remove_item_from_cart(db, cart, product_id)
    except HTTPException as e:
        # Handle specific errors
        if e.status_code == 404:
            raise HTTPException(status_code=404, detail="Item not found in cart.")
        raise

@router.delete("/clear", response_model=schemas.Cart)
async def clear_cart(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_active_user_optional),
):
    """Remove all items from the cart."""
    cart = crud.cart_crud.get_cart_for_user_or_guest(request, response, db, current_user)
    return crud.cart_crud.clear_cart(db, cart)


@router.get("/count", response_model=int)
async def get_cart_item_count(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_active_user_optional)
):
    """
    Get the total number of items in the cart (sum of quantities).
    Works for both authenticated users and guests.
    """
    cart = crud.cart_crud.get_cart_for_user_or_guest(request, response, db, current_user)
    return sum(item.quantity for item in cart.items) if cart and cart.items else 0


@router.get("/payment-methods", response_model=List[str])
async def get_payment_methods():
    """
    Get available offline payment methods.
    """
    return ["Cash on Delivery", "Visa Transfer", "Pickup in Store"]


# New endpoint for merging guest cart into user cart after login
@router.post("/merge", response_model=schemas.Cart)
async def merge_carts(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Merge guest cart into user cart after login
    
    This endpoint should be called after a guest user logs in. It transfers all items
    from the guest cart to the user's cart, combining quantities for duplicate products.
    """
    guest_cart_id = request.cookies.get("guest_cart_id")
    if not guest_cart_id:
        raise HTTPException(
            status_code=400,
            detail="No guest cart found to merge"
        )
    
    # Get guest cart
    guest_cart = crud.cart_crud.get_cart_by_cart_id(db, guest_cart_id)
    if not guest_cart:
        raise HTTPException(
            status_code=404,
            detail="Guest cart not found"
        )
    
    # Get or create user cart
    user_cart = crud.cart_crud.get_or_create_cart(db, user_id=current_user.id)
    
    # Merge carts
    for guest_item in guest_cart.items:
        # Check if item exists in user cart
        existing_item = next(
            (item for item in user_cart.items if item.product_id == guest_item.product_id),
            None
        )
        
        if existing_item:
            # Combine quantities
            new_quantity = existing_item.quantity + guest_item.quantity
            # Check stock availability
            if new_quantity > guest_item.product.stock_quantity:
                # Cap at max available stock
                existing_item.quantity = guest_item.product.stock_quantity
            else:
                existing_item.quantity = new_quantity
            # Remove guest item
            db.delete(guest_item)
        else:
            # Transfer item to user cart
            guest_item.cart_id = user_cart.id
    
    # Delete guest cart
    db.delete(guest_cart)
    db.commit()
    
    # Update cart total
    crud.cart_crud.update_cart_total(db, user_cart)
    
    # Clear guest cookie
    response.delete_cookie("guest_cart_id")
    
    return user_cart