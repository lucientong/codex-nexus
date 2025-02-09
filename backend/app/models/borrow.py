from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base

class BorrowRecord(Base):
    __tablename__ = "tb_data_borrow_records"

    id = Column(Integer, primary_key=True, index=True)
    collection_type = Column(Enum('book', 'magazine', 'cd', 'vinyl', 'dvd', 'game_cartridge', name='collection_type'), nullable=False)
    collection_id = Column(Integer, nullable=False)
    borrower_id = Column(Integer, ForeignKey('tb_data_users.id'), nullable=False)
    lender_id = Column(Integer, ForeignKey('tb_data_users.id'), nullable=False)
    status = Column(
        Enum('pending', 'approved', 'rejected', 'returned', name='borrow_status'),
        default='pending'
    )
    borrow_date = Column(DateTime)
    return_date = Column(DateTime)
    expected_return_date = Column(DateTime)
    note = Column(Text)
    is_anonymous = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联关系
    borrower = relationship("User", foreign_keys=[borrower_id], back_populates="borrow_records")
    lender = relationship("User", foreign_keys=[lender_id], back_populates="lend_records") 