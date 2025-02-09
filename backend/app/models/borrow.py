from datetime import datetime, UTC
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
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    # 关联关系
    borrower = relationship("User", foreign_keys=[borrower_id], back_populates="borrow_records")
    lender = relationship("User", foreign_keys=[lender_id], back_populates="lend_records")
    
    # 藏品关系
    book = relationship(
        "Book",
        primaryjoin="and_(BorrowRecord.collection_id == Book.id, "
                   "BorrowRecord.collection_type == 'book')",
        foreign_keys=[collection_id],
        back_populates="borrow_records",
        overlaps="magazine,cd,vinyl_record,dvd,game_cartridge"
    )
    
    magazine = relationship(
        "Magazine",
        primaryjoin="and_(BorrowRecord.collection_id == Magazine.id, "
                   "BorrowRecord.collection_type == 'magazine')",
        foreign_keys=[collection_id],
        back_populates="borrow_records",
        overlaps="book,cd,vinyl_record,dvd,game_cartridge"
    )
    
    cd = relationship(
        "CD",
        primaryjoin="and_(BorrowRecord.collection_id == CD.id, "
                   "BorrowRecord.collection_type == 'cd')",
        foreign_keys=[collection_id],
        back_populates="borrow_records",
        overlaps="book,magazine,vinyl_record,dvd,game_cartridge"
    )
    
    vinyl_record = relationship(
        "VinylRecord",
        primaryjoin="and_(BorrowRecord.collection_id == VinylRecord.id, "
                   "BorrowRecord.collection_type == 'vinyl')",
        foreign_keys=[collection_id],
        back_populates="borrow_records",
        overlaps="book,magazine,cd,dvd,game_cartridge"
    )
    
    dvd = relationship(
        "DVD",
        primaryjoin="and_(BorrowRecord.collection_id == DVD.id, "
                   "BorrowRecord.collection_type == 'dvd')",
        foreign_keys=[collection_id],
        back_populates="borrow_records",
        overlaps="book,magazine,cd,vinyl_record,game_cartridge"
    )
    
    game_cartridge = relationship(
        "GameCartridge",
        primaryjoin="and_(BorrowRecord.collection_id == GameCartridge.id, "
                   "BorrowRecord.collection_type == 'game_cartridge')",
        foreign_keys=[collection_id],
        back_populates="borrow_records",
        overlaps="book,magazine,cd,vinyl_record,dvd"
    )
    
    def get_collection(self, db):
        """获取关联的藏品对象"""
        from app.models.collection import Book, Magazine, CD, VinylRecord, DVD, GameCartridge
        
        collection_map = {
            'book': Book,
            'magazine': Magazine,
            'cd': CD,
            'vinyl': VinylRecord,
            'dvd': DVD,
            'game_cartridge': GameCartridge
        }
        
        collection_class = collection_map.get(self.collection_type)
        if collection_class:
            return db.query(collection_class).filter(collection_class.id == self.collection_id).first()
        return None