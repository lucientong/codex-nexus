from fastapi import APIRouter
from .auth import router as auth_router
from .collection import router as collection_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(collection_router, prefix="/collections", tags=["collections"]) 