from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.library import Library

class LibraryService:
    def get(self, db: Session, library_id: int) -> Optional[Library]:
        """获取单个书房"""
        return db.query(Library).filter(Library.id == library_id).first()
    
    def get_multi(
        self,
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Library]:
        """获取用户的书房列表"""
        return db.query(Library)\
            .filter(Library.owner_id == user_id)\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    def verify_owner(self, db: Session, library_id: int, user_id: int) -> bool:
        """验证用户是否为书房所有者"""
        library = self.get(db, library_id)
        if not library:
            return False
        return library.owner_id == user_id

# 服务实例
library_service = LibraryService() 