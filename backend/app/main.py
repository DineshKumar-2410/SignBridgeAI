from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .routes import auth, ml, translate
from .database import engine, Base
from .models.user import User
from .models.conversation import Conversation

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SignBridge AI API",
    description="Indian Sign Language Communication Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(ml.router, prefix="/api/ml", tags=["machine-learning"])
app.include_router(translate.router, prefix="/api/translate", tags=["translation"])

@app.get("/")
async def root():
    return {"message": "SignBridge AI backend is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}