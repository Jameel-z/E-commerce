import logging
from sqlalchemy.orm import Session
from models.user import User
from core.security import get_password_hash
from core.config import settings

logger = logging.getLogger(__name__)


def seed_admin(db: Session) -> None:
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        return

    existing = db.query(User).filter(User.is_admin == True).first()
    if existing:
        logger.info("✅ Admin user already exists, skipping seed")
        return

    admin = User(
        name="Admin",
        email=settings.ADMIN_EMAIL,
        hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
        is_active=True,
        is_admin=True,
    )
    db.add(admin)
    db.commit()
    logger.info(f"✅ Admin user created: {settings.ADMIN_EMAIL}")
