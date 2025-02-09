from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base

class ReadingRecord(Base):
    __tablename__ = "tb_data_reading_records"

    id = Column(Integer, primary_key=True, index=True)
    collection_type = Column(Enum('book', 'magazine', 'cd', 'vinyl', 'dvd', 'game_cartridge', name='collection_type'), nullable=False)
    collection_id = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey('tb_data_users.id'), nullable=False)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration = Column(Integer)  # 阅读时长（分钟）
    progress = Column(Float)  # 阅读进度（百分比）
    rating = Column(Integer)  # 评分（1-5）
    note = Column(Text)  # 笔记
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联关系
    user = relationship("User", back_populates="reading_records") 