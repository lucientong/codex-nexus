from typing import Annotated
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security.deps import CurrentUser
from app.models.collection import Book, Magazine, CD, VinylRecord, DVD, GameCartridge
from app.services.library import library_service

def verify_library_owner(
    library_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db)
) -> bool:
    """验证当前用户是否为书房所有者"""
    if not library_service.verify_owner(db, library_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return True

def verify_collection_owner(
    collection_id: int,
    collection_type: str,
    current_user: CurrentUser,
    db: Session = Depends(get_db)
) -> bool:
    """验证当前用户是否为藏品所有者"""
    # 获取藏品对应的模型类
    model_map = {
        'book': Book,
        'magazine': Magazine,
        'cd': CD,
        'vinyl': VinylRecord,
        'dvd': DVD,
        'game_cartridge': GameCartridge
    }
    model = model_map.get(collection_type)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid collection type"
        )
    
    # 获取藏品
    collection = db.query(model).filter(model.id == collection_id).first()
    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{collection_type.title()} not found"
        )
    
    # 验证所有权
    if not library_service.verify_owner(db, collection.library_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return True

# 创建依赖项类型
LibraryOwner = Annotated[bool, Depends(verify_library_owner)]
CollectionOwner = Annotated[bool, Depends(verify_collection_owner)] 