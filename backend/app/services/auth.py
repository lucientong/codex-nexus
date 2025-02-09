from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.core.security.jwt import create_access_token
from app.core.security.wechat import get_openid_and_session_key, verify_user_info
from app.models.user import User
from app.schemas.auth import Token, UserInfo

async def authenticate_user(
    db: Session,
    code: str,
    nickname: Optional[str] = None,
    avatar_url: Optional[str] = None,
    raw_data: Optional[str] = None,
    signature: Optional[str] = None
) -> tuple[User, Token]:
    """
    用户认证
    """
    # 获取openid和session_key
    openid, session_key = get_openid_and_session_key(code)
    
    # 验证用户信息（如果提供）
    if raw_data and signature:
        if not verify_user_info(session_key, raw_data, signature):
            raise ValueError("Invalid user info signature")
    
    # 查找或创建用户
    user = db.query(User).filter(User.openid == openid).first()
    if not user:
        user = User(
            openid=openid,
            nickname=nickname,
            avatar_url=avatar_url
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif nickname and avatar_url:
        # 更新用户信息
        user.nickname = nickname
        user.avatar_url = avatar_url
        db.commit()
        db.refresh(user)
    
    # 创建访问令牌
    access_token = create_access_token(
        data={"sub": str(user.id), "openid": user.openid},
        expires_delta=timedelta(minutes=30)
    )
    
    return user, Token(access_token=access_token)

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """
    通过ID获取用户
    """
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_openid(db: Session, openid: str) -> Optional[User]:
    """
    通过openid获取用户
    """
    return db.query(User).filter(User.openid == openid).first() 