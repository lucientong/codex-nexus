from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base

class User(Base):
    __tablename__ = "tb_data_users"

    id = Column(Integer, primary_key=True, index=True)
    openid = Column(String(64), unique=True, index=True, nullable=False)
    nickname = Column(String(64))
    avatar_url = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联关系
    libraries = relationship("Library", back_populates="owner")
    borrow_records = relationship("BorrowRecord", foreign_keys='BorrowRecord.borrower_id', back_populates="borrower")
    lend_records = relationship("BorrowRecord", foreign_keys='BorrowRecord.lender_id', back_populates="lender")
    reading_records = relationship("ReadingRecord", back_populates="user") 