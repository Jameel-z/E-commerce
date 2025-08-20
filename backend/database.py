from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import logging
from core.config import settings

# Logging config
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Step 1: Create DB if it doesn't exist
def create_database():
    try:
        # Create temporary connection string without database name
        temp_url = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/postgres"
        root_engine = create_engine(
            temp_url,
            isolation_level="AUTOCOMMIT"
        )
        
        with root_engine.connect() as conn:
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{settings.DB_NAME}'"))
            if not result.scalar():
                conn.execute(text(f"CREATE DATABASE {settings.DB_NAME}"))
                logger.info(f"✅ Database '{settings.DB_NAME}' created successfully!")
            else:
                logger.info(f"✅ Database '{settings.DB_NAME}' already exists")
    except OperationalError as e:
        logger.error(f"❌ Failed to create database: {e}")
        raise

create_database()

# Step 2: Engine & Session
def get_engine():
    logger.info("Connecting to database")
    return create_engine(settings.DATABASE_URL)

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Step 3: Table creation
from models.base import Base

def create_tables():
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Tables created successfully!")

# Step 4: FastAPI dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()