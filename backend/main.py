from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, products, categories, carts, orders
from database import create_database, create_tables, SessionLocal
from fastapi.staticfiles import StaticFiles
from core.config import settings
from core.middleware import cleanup_temp_files
from core.seed import seed_admin

create_database()
create_tables()

with SessionLocal() as db:
    seed_admin(db)

# Add parent_id to categories if it doesn't exist yet (safe migration)
from database import engine
from sqlalchemy import text
with engine.connect() as conn:
    conn.execute(text(
        "ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER "
        "REFERENCES categories(id) ON DELETE SET NULL"
    ))
    conn.execute(text(
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS full_description TEXT"
    ))
    conn.execute(text(
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100)"
    ))
    conn.execute(text(
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100)"
    ))
    conn.execute(text(
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS tags VARCHAR(500)"
    ))
    conn.commit()

app = FastAPI(title="E-commerce Backend API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.middleware("http")(cleanup_temp_files)

# Configure static files
app.mount(
    "/static",
    StaticFiles(directory=settings.STATIC_DIR),
    name="static"
)

# Include routers
app.include_router(users.router, tags=["Users"])
app.include_router(products.router, tags=["Products"])
app.include_router(categories.router, tags=["Categories"])
app.include_router(carts.router, tags=["Carts"])
app.include_router(orders.router, tags=["Orders"])


@app.get("/")
def read_root():
    return {"message": "E-commerce Backend API"}