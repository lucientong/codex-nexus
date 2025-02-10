from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class CollectionBase(BaseModel):
    """藏品基础模型"""
    title: str = Field(..., min_length=1, max_length=256)
    cover_url: Optional[str] = Field(None, max_length=512)
    description: Optional[str] = None
    purchase_price: Optional[float] = Field(None, ge=0)
    market_price: Optional[float] = Field(None, ge=0)
    location: Optional[str] = Field(None, max_length=128)
    status: str = "in_library"

class BookCreate(CollectionBase):
    """创建图书请求"""
    isbn: Optional[str] = Field(None, max_length=13, pattern=r"^[0-9-]{10,13}$")
    author: Optional[str] = Field(None, max_length=256)
    publisher: Optional[str] = Field(None, max_length=128)
    publish_date: Optional[datetime] = None
    language: Optional[str] = Field(None, max_length=32)
    page_count: Optional[int] = Field(None, gt=0)

class MagazineCreate(CollectionBase):
    """创建杂志请求"""
    issn: Optional[str] = Field(None, max_length=8, pattern=r"^[0-9]{4}-[0-9]{3}[0-9X]$")
    publisher: Optional[str] = Field(None, max_length=128)
    issue_number: Optional[str] = Field(None, max_length=32)
    publish_date: Optional[datetime] = None
    language: Optional[str] = Field(None, max_length=32)

class CDCreate(CollectionBase):
    """创建CD请求"""
    isrc: Optional[str] = Field(None, max_length=12, pattern=r"^[A-Z]{2}-[A-Z0-9]{3}-[0-9]{2}-[0-9]{5}$")
    artist: Optional[str] = Field(None, max_length=256)
    label: Optional[str] = Field(None, max_length=128)
    release_date: Optional[datetime] = None
    genre: Optional[str] = Field(None, max_length=64)
    duration: Optional[int] = Field(None, gt=0)

class VinylRecordCreate(CollectionBase):
    """创建黑胶唱片请求"""
    isrc: Optional[str] = Field(None, max_length=12, pattern=r"^[A-Z]{2}-[A-Z0-9]{3}-[0-9]{2}-[0-9]{5}$")
    artist: Optional[str] = Field(None, max_length=256)
    label: Optional[str] = Field(None, max_length=128)
    release_date: Optional[datetime] = None
    genre: Optional[str] = Field(None, max_length=64)
    rpm: Optional[int] = Field(None, gt=0)
    size: Optional[float] = Field(None, gt=0)
    duration: Optional[int] = Field(None, gt=0)

class DVDCreate(CollectionBase):
    """创建DVD请求"""
    isan: Optional[str] = Field(None, max_length=26)
    director: Optional[str] = Field(None, max_length=256)
    studio: Optional[str] = Field(None, max_length=128)
    release_date: Optional[datetime] = None
    genre: Optional[str] = Field(None, max_length=64)
    duration: Optional[int] = Field(None, gt=0)
    region_code: Optional[str] = Field(None, max_length=8)

class GameCartridgeCreate(CollectionBase):
    """创建游戏卡带请求"""
    product_code: Optional[str] = Field(None, max_length=32)
    developer: Optional[str] = Field(None, max_length=256)
    publisher: Optional[str] = Field(None, max_length=256)
    platform: Optional[str] = Field(None, max_length=64)
    release_date: Optional[datetime] = None
    genre: Optional[str] = Field(None, max_length=64)
    region: Optional[str] = Field(None, max_length=32)
    language: Optional[str] = Field(None, max_length=32)

# 响应模型
class CollectionResponse(CollectionBase):
    """藏品响应基类"""
    id: int
    library_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BookResponse(CollectionResponse, BookCreate):
    """图书响应"""
    pass

class MagazineResponse(CollectionResponse, MagazineCreate):
    """杂志响应"""
    pass

class CDResponse(CollectionResponse, CDCreate):
    """CD响应"""
    pass

class VinylRecordResponse(CollectionResponse, VinylRecordCreate):
    """黑胶唱片响应"""
    pass

class DVDResponse(CollectionResponse, DVDCreate):
    """DVD响应"""
    pass

class GameCartridgeResponse(CollectionResponse, GameCartridgeCreate):
    """游戏卡带响应"""
    pass 