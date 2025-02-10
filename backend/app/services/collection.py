from typing import Optional, List, Type, TypeVar, Generic
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.collection import Book, Magazine, CD, VinylRecord, DVD, GameCartridge, CollectionBase
from app.schemas.collection import (
    BookCreate, MagazineCreate, CDCreate, VinylRecordCreate, DVDCreate, GameCartridgeCreate,
    BookResponse, MagazineResponse, CDResponse, VinylRecordResponse, DVDResponse, GameCartridgeResponse
)

T = TypeVar('T', Book, Magazine, CD, VinylRecord, DVD, GameCartridge)
CreateSchema = TypeVar('CreateSchema', BookCreate, MagazineCreate, CDCreate, VinylRecordCreate, DVDCreate, GameCartridgeCreate)
ResponseSchema = TypeVar('ResponseSchema', BookResponse, MagazineResponse, CDResponse, VinylRecordResponse, DVDResponse, GameCartridgeResponse)

class CollectionService(Generic[T, CreateSchema, ResponseSchema]):
    """藏品服务基类"""
    def __init__(self, model: Type[T]):
        self.model = model

    def create(self, db: Session, library_id: int, data: CreateSchema) -> T:
        """创建藏品"""
        db_obj = self.model(**data.model_dump(), library_id=library_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get(self, db: Session, collection_id: int) -> Optional[T]:
        """获取单个藏品"""
        return db.query(self.model).filter(self.model.id == collection_id).first()

    def get_multi(
        self,
        db: Session,
        library_id: int,
        skip: int = 0,
        limit: int = 100,
        keyword: Optional[str] = None
    ) -> List[T]:
        """获取藏品列表"""
        query = db.query(self.model).filter(self.model.library_id == library_id)
        
        if keyword:
            query = query.filter(
                or_(
                    self.model.title.ilike(f"%{keyword}%"),
                    self.model.description.ilike(f"%{keyword}%")
                )
            )
        
        return query.offset(skip).limit(limit).all()

    def update(self, db: Session, db_obj: T, data: CreateSchema) -> T:
        """更新藏品"""
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, collection_id: int) -> bool:
        """删除藏品"""
        db_obj = self.get(db, collection_id)
        if not db_obj:
            return False
        db.delete(db_obj)
        db.commit()
        return True

# 具体藏品服务类
class BookService(CollectionService[Book, BookCreate, BookResponse]):
    def __init__(self):
        super().__init__(Book)

    def get_by_isbn(self, db: Session, isbn: str) -> Optional[Book]:
        """通过ISBN获取图书"""
        return db.query(self.model).filter(self.model.isbn == isbn).first()

class MagazineService(CollectionService[Magazine, MagazineCreate, MagazineResponse]):
    def __init__(self):
        super().__init__(Magazine)

    def get_by_issn(self, db: Session, issn: str) -> Optional[Magazine]:
        """通过ISSN获取杂志"""
        return db.query(self.model).filter(self.model.issn == issn).first()

class CDService(CollectionService[CD, CDCreate, CDResponse]):
    def __init__(self):
        super().__init__(CD)

    def get_by_isrc(self, db: Session, isrc: str) -> Optional[CD]:
        """通过ISRC获取CD"""
        return db.query(self.model).filter(self.model.isrc == isrc).first()

class VinylRecordService(CollectionService[VinylRecord, VinylRecordCreate, VinylRecordResponse]):
    def __init__(self):
        super().__init__(VinylRecord)

    def get_by_isrc(self, db: Session, isrc: str) -> Optional[VinylRecord]:
        """通过ISRC获取黑胶唱片"""
        return db.query(self.model).filter(self.model.isrc == isrc).first()

class DVDService(CollectionService[DVD, DVDCreate, DVDResponse]):
    def __init__(self):
        super().__init__(DVD)

    def get_by_isan(self, db: Session, isan: str) -> Optional[DVD]:
        """通过ISAN获取DVD"""
        return db.query(self.model).filter(self.model.isan == isan).first()

class GameCartridgeService(CollectionService[GameCartridge, GameCartridgeCreate, GameCartridgeResponse]):
    def __init__(self):
        super().__init__(GameCartridge)

    def get_by_product_code(self, db: Session, product_code: str) -> Optional[GameCartridge]:
        """通过产品编号获取游戏卡带"""
        return db.query(self.model).filter(self.model.product_code == product_code).first()

# 服务实例
book_service = BookService()
magazine_service = MagazineService()
cd_service = CDService()
vinyl_record_service = VinylRecordService()
dvd_service = DVDService()
game_cartridge_service = GameCartridgeService() 