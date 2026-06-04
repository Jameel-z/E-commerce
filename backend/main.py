from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, products, categories, carts, orders, banners
from database import create_database, create_tables, SessionLocal
from fastapi.staticfiles import StaticFiles
from core.config import settings
from core.middleware import cleanup_temp_files, category_image_fallback
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
    conn.execute(text(
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS condition VARCHAR(100)"
    ))
    conn.execute(text(
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping VARCHAR(200)"
    ))
    conn.execute(text(
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS vat VARCHAR(100)"
    ))
    conn.execute(text(
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE"
    ))
    conn.execute(text(
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_order INTEGER NOT NULL DEFAULT 0"
    ))
    conn.execute(text(
        "ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN NOT NULL DEFAULT FALSE"
    ))
    conn.execute(text(
        "ALTER TABLE categories ADD COLUMN IF NOT EXISTS homepage_order INTEGER NOT NULL DEFAULT 0"
    ))
    conn.execute(text(
        "ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_category_row BOOLEAN NOT NULL DEFAULT FALSE"
    ))
    conn.execute(text(
        "ALTER TABLE categories ADD COLUMN IF NOT EXISTS category_row_order INTEGER NOT NULL DEFAULT 0"
    ))

    # pg_trgm: enable extension + create GIN indexes for fast ILIKE search
    # These match the replace() expressions used in product_crud search queries
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_products_name_trgm
        ON products USING GIN (replace(name, '-', '') gin_trgm_ops)
    """))
    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_products_desc_trgm
        ON products USING GIN (replace(description, '-', '') gin_trgm_ops)
    """))
    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_categories_name_trgm
        ON categories USING GIN (replace(name, '-', '') gin_trgm_ops)
    """))

    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS banners (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200),
            subtitle VARCHAR(500),
            cta_text VARCHAR(100),
            cta_link VARCHAR(500),
            media_url VARCHAR(500) NOT NULL,
            media_type VARCHAR(10) NOT NULL DEFAULT 'image',
            text_position VARCHAR(20) NOT NULL DEFAULT 'middle-center',
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            display_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(text(
        "ALTER TABLE banners ADD COLUMN IF NOT EXISTS text_position VARCHAR(20) NOT NULL DEFAULT 'middle-center'"
    ))
    conn.execute(text(
        "ALTER TABLE banners ADD COLUMN IF NOT EXISTS hide_overlay BOOLEAN NOT NULL DEFAULT FALSE"
    ))
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS category_row_pins (
            id SERIAL PRIMARY KEY,
            category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            pin_order INTEGER NOT NULL DEFAULT 0,
            CONSTRAINT uq_category_product_pin UNIQUE (category_id, product_id)
        )
    """))

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
app.middleware("http")(category_image_fallback)

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
app.include_router(banners.router, tags=["Banners"])


@app.get("/")
def read_root():
    return {"message": "E-commerce Backend API"}