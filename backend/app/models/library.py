from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base

class Library(Base):
    __tablename__ = "tb_data_libraries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(String(512))
    visibility = Column(Enum('private', 'friends', 'public', name='visibility_type'), default='private')
    owner_id = Column(Integer, ForeignKey('tb_data_users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联关系
    owner = relationship("User", back_populates="libraries")
    collections = relationship("Collection", back_populates="library", cascade="all, delete-orphan") 