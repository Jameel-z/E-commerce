from datetime import datetime
from typing import Optional
from pydantic import EmailStr, Field, field_validator
from pydantic_core import PydanticCustomError
import dns.resolver
import dns.exception
from .base import BaseSchema, TimestampSchema

# Disposable / temporary email domains to block
_DISPOSABLE_DOMAINS = {
    "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
    "guerrillamail.de", "guerrillamail.biz", "guerrillamail.info",
    "temp-mail.org", "tempmail.com", "throwam.com", "throwaway.email",
    "fakeinbox.com", "sharklasers.com", "guerrillamailblock.com",
    "grr.la", "guerrillamail.de", "spam4.me", "yopmail.com", "yopmail.fr",
    "trashmail.com", "trashmail.me", "trashmail.at", "trashmail.io",
    "dispostable.com", "mailnull.com", "spamgourmet.com", "spamgourmet.net",
    "maildrop.cc", "discard.email", "spamex.com", "jetable.fr.nf",
    "nomail.xl.cx", "superrito.com", "spamfree24.org", "mail-temporaire.fr",
    "wegwerfmail.de", "wegwerfmail.net", "wegwerfmail.org",
    "10minutemail.com", "10minutemail.net", "10minutemail.org",
    "20minutemail.com", "mytemp.email", "tempr.email", "dispostable.com",
    "mailtemp.info", "tempail.com", "mohmal.com", "mailnesia.com",
    "spamgourmet.org", "spamgourmet.com", "binkmail.com", "bob.email",
}

def _validate_email_domain(email: str) -> str:
    """Block disposable email domains."""
    domain = email.lower().split("@")[-1] if "@" in email else ""
    if domain in _DISPOSABLE_DOMAINS:
        raise ValueError(
            "Disposable or temporary email addresses are not allowed. "
            "Please use a real email address."
        )
    return email


def check_email_mx(email: str) -> bool:
    """Return True if the email domain has valid MX records, False otherwise.
    Falls back to True on unexpected DNS errors to avoid blocking legitimate users."""
    try:
        domain = email.split("@")[-1]
        dns.resolver.resolve(domain, "MX")
        return True
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
        return False
    except dns.exception.DNSException:
        return True


class UserBase(BaseSchema):
    name: Optional[str] = Field(
        None,
        max_length=100,
        description="User's full name",
        examples=["John Doe"]
    )
    email: EmailStr = Field(..., examples=["user@example.com"])
    is_active: bool = Field(default=True)

class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        max_length=64,
        description="Must be 8-64 chars with at least 1 uppercase, 1 lowercase and 1 number",
        examples=["Pass123word"]
    )

    @field_validator('email', mode='before')
    @classmethod
    def validate_email_domain(cls, v: str) -> str:
        return _validate_email_domain(str(v))

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if 'password' in v.lower():
            raise PydanticCustomError(
                'password_contains_password',
                "Password should not contain the word 'password'"
            )
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v


class GoogleAuthRequest(BaseSchema):
    """Google OAuth credential token from the frontend."""
    credential: str = Field(..., description="Google ID token from Google Sign-In")

class UserUpdate(BaseSchema):
    """Schema for updating user password"""
    name: Optional[str] = Field(
        None,
        max_length=100,
        description="User's full name",
        examples=["changed name"]
    )
    password: Optional[str] = Field(
        None,
        min_length=8,
        max_length=64,
        description="Must be 8-64 chars with at least 1 uppercase, 1 lowercase and 1 number",
        examples=["NewPass123"]
    )

    @field_validator('password')
    @classmethod
    def validate_password_if_present(cls, v: Optional[str]) -> Optional[str]:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v
    
class User(TimestampSchema, UserBase):
    """Full user schema returned in responses"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_admin: bool = Field(default=False)  # Internal use only

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "is_active": True,
                "created_at": "2025-01-01T00:00:00",
                "updated_at": "2025-01-02T00:00:00",
                "is_admin": False,
            }
        }
    }

class UserInDB(User):
    """Extended user schema for internal use (includes hashed password)"""
    hashed_password: str = Field(exclude=True)  # Never include in responses