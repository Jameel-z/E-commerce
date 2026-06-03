import urllib.request
import urllib.error
import json

from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import timedelta

from database import get_db
from schemas.user import User, UserCreate, UserUpdate, GoogleAuthRequest, check_email_mx
from crud.user_crud import user_crud
from core.security import (
    authenticate_user,
    create_access_token,
    create_verification_token,
    decode_verification_token,
    get_current_active_user,
    Token
)
from core.config import settings
from core.email import send_verification_email
from core.recaptcha import verify_recaptcha

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    recaptcha_token: Annotated[str, Form()] = "",
    db: Session = Depends(get_db)
):
    if not verify_recaptcha(recaptcha_token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="reCAPTCHA verification failed. Please try again.",
        )
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in. Check your inbox for a verification link.",
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

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    if not verify_recaptcha(user.recaptcha_token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="reCAPTCHA verification failed. Please try again.",
        )
    if not check_email_mx(user.email):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email address does not appear to be valid. Please use a real email address."
        )
    existing_user = user_crud.get_by_email(db, email=user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    user_data = user.model_copy(update={"is_active": False})
    new_user = user_crud.create(db=db, obj_in=user_data)
    token = create_verification_token(new_user.email)
    send_verification_email(new_user.email, token)
    return {"message": "Account created. Please check your email to verify your account."}


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    email = decode_verification_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification link."
        )
    user = user_crud.get_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if user.is_active:
        return {"message": "Email already verified. You can log in."}
    user_crud.update(db, db_obj=user, obj_in={"is_active": True})
    return {"message": "Email verified successfully. You can now log in."}

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
    if user_id != current_user.id and not current_user.is_admin:
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

@router.post("/google-auth", response_model=Token)
def google_auth(
    body: GoogleAuthRequest,
    db: Session = Depends(get_db),
):
    """Verify a Google ID token and return a local JWT access token."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google authentication is not configured on this server.",
        )

    # Verify the Google ID token by calling Google's tokeninfo endpoint
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={body.credential}"
        with urllib.request.urlopen(url, timeout=10) as resp:
            payload = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token.",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not verify Google token. Please try again.",
        )

    # Validate the token was issued for our app
    if payload.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token was not issued for this application.",
        )

    email = payload.get("email")
    if not email or not payload.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account email is not verified.",
        )

    name = payload.get("name") or payload.get("given_name")
    user = user_crud.get_or_create_google_user(db, email=email, name=name)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            data={"sub": user.email, "is_admin": user.is_admin},
            expires_delta=access_token_expires,
        ),
        "token_type": "bearer",
        "expires_in": access_token_expires.seconds,
    }


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
    
    # Validate name length if provided
    if user_update.name and len(user_update.name) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name cannot exceed 100 characters"
        )
    return user_crud.update(
        db=db,
        db_obj=db_user,
        obj_in=user_update
    )