from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, products, categories, carts
from database import create_database, create_tables

create_database()
create_tables() 

app = FastAPI(title="E-commerce Backend API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, tags=["Users"])
app.include_router(products.router, tags=["Products"])
app.include_router(categories.router, tags=["Categories"])
app.include_router(carts.router, tags=["Carts"])


@app.get("/")
def read_root():
    return {"message": "E-commerce Backend API"}