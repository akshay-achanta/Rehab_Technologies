from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app.database import Base, engine
from app.routers import auth, services, requests, users
from app import models

load_dotenv()

# Create DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Rehab Technologies API",
    description="Backend API for Rehab Technologies structural repair services portal.",
    version="1.0.0",
)

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(requests.router)
app.include_router(users.router)


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "message": "Rehab Technologies API is running"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "healthy"}
