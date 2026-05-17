# core/security.py
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt
from typing import Optional, Annotated
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from schemas.user import User
from .config import settings


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Token scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/token", auto_error=False)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = Field(
        default_factory=lambda: settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        description="Token expiration time in seconds"
    )


class TokenData(BaseModel):
    email: Optional[str] = None
    is_admin: bool = False


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if password matches hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate JWT token with timezone-aware datetime"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "is_admin": data.get("is_admin", False)})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Verify and decode JWT"""
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)]
) -> User:
    """Dependency to get current user from JWT"""
    from crud.user_crud import user_crud
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        if payload is None:
            raise credentials_exception
        email: str = payload.get("sub")
        is_admin: bool = payload.get("is_admin", False)
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email, is_admin=is_admin)
    except JWTError:
        raise credentials_exception
    
    user = user_crud.get_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """Dependency to get active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    from crud.user_crud import user_crud
    user = user_crud.get_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def require_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Dependency to require admin privileges.
    Raises HTTP 403 if user is not an admin.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

async def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Return user if valid token exists, otherwise None"""
    if not token:
        return None
    
    try:
        payload = decode_token(token)
        if not payload:
            return None
            
        email = payload.get("sub")
        if not email:
            return None

        from crud.user_crud import user_crud    
        user = user_crud.get_by_email(db, email=email)
        if user and user.is_active:
            return user
    except Exception:
        pass
        
    return None

async def get_current_active_user_optional(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Truly optional authentication for guest users"""
    token = request.headers.get("Authorization")
    if token and token.startswith("Bearer "):
        token = token.split(" ")[1]
        return await get_optional_user(token, db)
    return None