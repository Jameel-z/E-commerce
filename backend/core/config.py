from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path

class Settings(BaseSettings):
    """Application settings"""
    # Security settings
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    # Database settings
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: str
    DB_NAME: str

    # Static files settings
    STATIC_DIR: str = str(Path(__file__).parent.parent / "static")
    DOMAIN: str = "localhost:8000"  # Changed for development
    ASSET_VERSION: str = "1.0"  # Change this when you update assets

    @property
    def DATABASE_URL(self) -> str:
        """Generate database URL from components"""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # This will ignore extra fields in .env

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()