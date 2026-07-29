from fastapi import APIRouter
from ..ml import models as isl_models
from ..ml import speech_recognition

router = APIRouter()

# Include ML routers
router.include_router(isl_models.router, prefix="/isl", tags=["ISL"])
router.include_router(speech_recognition.router, prefix="/speech", tags=["Speech"])