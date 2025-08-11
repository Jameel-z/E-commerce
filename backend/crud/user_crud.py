from sqlalchemy.orm import Session
from typing import Optional, Any
from .base_crud import CRUDBase
from models import User
from schemas import UserCreate, UserUpdate
from core.security import get_password_hash, verify_password

class UserCRUD(CRUDBase[User, UserCreate, UserUpdate]):
    """User-specific CRUD with authentication support"""
    
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(self.model).filter(self.model.email == email).first()


    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        create_data = obj_in.model_dump()
        create_data["hashed_password"] = get_password_hash(create_data.pop("password"))
        create_data["is_admin"] = create_data.get("is_admin", False) 
        create_data["name"] = create_data.get("name")    
        return super().create(db, obj_in=create_data)


    def update(
        self,
        db: Session,
        *,
        db_obj: User,
        obj_in: UserUpdate | dict[str, Any]
    ) -> User:
        update_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)
        
        # Special handling for password updates
        if "password" in update_data and update_data["password"]:
            hashed_password = get_password_hash(update_data.pop("password"))
            update_data["hashed_password"] = hashed_password

        # Ensure name updates are handled (can be None)
        if "name" in update_data:
            # Allow explicitly setting name to None
            db_obj.name = update_data.get("name")
            
        return super().update(db, db_obj=db_obj, obj_in=update_data)
    
    def authenticate(
        self, 
        db: Session, 
        *, 
        email: str, 
        password: str
    ) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
user_crud = UserCRUD(User)