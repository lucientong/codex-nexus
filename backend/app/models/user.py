from datetime import datetime, UTC
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base

class User(Base):
    __tablename__ = "tb_data_users"

    id = Column(Integer, primary_key=True, index=True)
    openid = Column(String(64), unique=True, index=True, nullable=False)
    nickname = Column(String(32))
    avatar_url = Column(String(255))
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(11), unique=True, index=True)
    bio = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    # 关联关系
    libraries = relationship("Library", back_populates="owner")
    borrow_records = relationship("BorrowRecord", foreign_keys='BorrowRecord.borrower_id', back_populates="borrower")
    lend_records = relationship("BorrowRecord", foreign_keys='BorrowRecord.lender_id', back_populates="lender")
    reading_records = relationship("ReadingRecord", back_populates="user") 