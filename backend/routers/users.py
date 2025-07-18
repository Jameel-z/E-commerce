from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import timedelta

from database import get_db
from schemas.user import User, UserCreate, UserUpdate
from crud.user_crud import user_crud
from core.security import (
    authenticate_user,
    create_access_token,
    get_current_active_user,
    Token
)
from core.config import settings

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            data={"sub": user.email, "is_admin": user.is_admin},
            expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "expires_in": access_token_expires.seconds
    }

@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = user_crud.get_by_email(db, email=user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return user_crud.create(db=db, obj_in=user)

@router.get("/me", response_model=User)
async def read_current_user(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    return current_user

@router.get("/{user_id}", response_model=User)
def read_user(
    current_user: Annotated[User, Depends(get_current_active_user)],
    user_id: int,
    db: Session = Depends(get_db)
):
    if user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_user = user_crud.get(db, id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user

@router.patch("/me", response_model=User)
def update_current_user(
    current_user: Annotated[User, Depends(get_current_active_user)],
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    db_user = user_crud.get(db, id=current_user.id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user_crud.update(
        db=db,
        db_obj=db_user,
        obj_in=user_update
    )