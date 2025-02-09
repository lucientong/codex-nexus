from datetime import datetime, UTC
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.collection import Book, Magazine, CD, VinylRecord, DVD, GameCartridge

class Library(Base):
    __tablename__ = "tb_data_libraries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(String(512))
    visibility = Column(Enum('private', 'friends', 'public', name='visibility_type'), default='private')
    owner_id = Column(Integer, ForeignKey('tb_data_users.id'), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    # 关联关系
    owner = relationship("User", back_populates="libraries")
    books = relationship("Book", back_populates="library", cascade="all, delete-orphan")
    magazines = relationship("Magazine", back_populates="library", cascade="all, delete-orphan")
    cds = relationship("CD", back_populates="library", cascade="all, delete-orphan")
    vinyl_records = relationship("VinylRecord", back_populates="library", cascade="all, delete-orphan")
    dvds = relationship("DVD", back_populates="library", cascade="all, delete-orphan")
    game_cartridges = relationship("GameCartridge", back_populates="library", cascade="all, delete-orphan") 