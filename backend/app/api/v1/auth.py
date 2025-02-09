from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.schemas.auth import WeChatLoginRequest, Token, UserInfo, UserUpdateRequest
from app.services.auth import authenticate_user
from app.core.security.deps import CurrentUser

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    request: WeChatLoginRequest,
    db: Session = Depends(get_db)
):
    """
    微信小程序登录
    """
    try:
        user, token = await authenticate_user(
            db=db,
            code=request.code,
            nickname=request.nickname,
            avatar_url=request.avatar_url,
            raw_data=request.raw_data,
            signature=request.signature
        )
        return token
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/me", response_model=UserInfo)
async def get_current_user_info(current_user: CurrentUser):
    """
    获取当前用户信息
    """
    return current_user

@router.put("/me", response_model=UserInfo)
async def update_user_info(
    update_data: UserUpdateRequest,
    current_user: CurrentUser,
    db: Session = Depends(get_db)
):
    """
    更新当前用户信息
    """
    try:
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(current_user, field, value)
        
        db.commit()
        db.refresh(current_user)
        return current_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or phone number already registered"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_account(
    current_user: CurrentUser,
    db: Session = Depends(get_db)
):
    """
    注销当前用户账号
    """
    current_user.is_active = False
    db.commit() 