from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Float, Text
from sqlalchemy.orm import relationship, declared_attr

from app.core.database import Base

class CollectionBase(Base):
    """藏品基类"""
    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    cover_url = Column(String(512))
    description = Column(Text)
    purchase_price = Column(Float)
    market_price = Column(Float)
    location = Column(String(128))  # 存放位置
    status = Column(Enum('in_library', 'borrowed', 'given', name='collection_status'), default='in_library')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @declared_attr
    def library_id(cls):
        return Column(Integer, ForeignKey('tb_data_libraries.id'), nullable=False)

    @declared_attr
    def library(cls):
        return relationship("Library", back_populates="collections")

    @declared_attr
    def borrow_records(cls):
        return relationship("BorrowRecord", back_populates="collection")

class Book(CollectionBase):
    """图书模型"""
    __tablename__ = "tb_data_books"

    isbn = Column(String(13), index=True)
    author = Column(String(256))
    publisher = Column(String(128))
    publish_date = Column(DateTime)
    language = Column(String(32))
    page_count = Column(Integer)

class Magazine(CollectionBase):
    """杂志模型"""
    __tablename__ = "tb_data_magazines"

    issn = Column(String(8), index=True)
    publisher = Column(String(128))
    issue_number = Column(String(32))
    publish_date = Column(DateTime)
    language = Column(String(32))

class CD(CollectionBase):
    """CD模型"""
    __tablename__ = "tb_data_cds"

    isrc = Column(String(12), index=True)
    artist = Column(String(256))
    label = Column(String(128))  # 唱片公司
    release_date = Column(DateTime)
    genre = Column(String(64))
    duration = Column(Integer)  # 时长（秒）

class VinylRecord(CollectionBase):
    """黑胶唱片模型"""
    __tablename__ = "tb_data_vinyl_records"

    isrc = Column(String(12), index=True)
    artist = Column(String(256))
    label = Column(String(128))  # 唱片公司
    release_date = Column(DateTime)
    genre = Column(String(64))
    rpm = Column(Integer)  # 转速
    size = Column(Float)  # 尺寸（英寸）
    duration = Column(Integer)  # 时长（秒）

class DVD(CollectionBase):
    """DVD模型"""
    __tablename__ = "tb_data_dvds"

    isan = Column(String(26), index=True)
    director = Column(String(256))
    studio = Column(String(128))
    release_date = Column(DateTime)
    genre = Column(String(64))
    duration = Column(Integer)  # 时长（分钟）
    region_code = Column(String(8))  # 区域码

class GameCartridge(CollectionBase):
    """游戏卡带模型"""
    __tablename__ = "tb_data_game_cartridges"

    product_code = Column(String(32), index=True)  # 产品编号
    developer = Column(String(256))  # 开发商
    publisher = Column(String(256))  # 发行商
    platform = Column(String(64))  # 平台（如FC/SFC/GB/GBA等）
    release_date = Column(DateTime)
    genre = Column(String(64))  # 游戏类型
    region = Column(String(32))  # 发行区域
    language = Column(String(32))  # 游戏语言 