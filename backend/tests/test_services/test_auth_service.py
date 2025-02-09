import pytest
from unittest.mock import patch
from app.services.auth import authenticate_user, get_user_by_id, get_user_by_openid
from app.core.security.wechat import WeChatError

@pytest.mark.asyncio
async def test_authenticate_user_new(db):
    """测试新用户认证"""
    with patch('app.services.auth.get_openid_and_session_key') as mock_get:
        mock_get.return_value = ("new_openid", "session_key")
        
        user, token = await authenticate_user(
            db=db,
            code="test_code",
            nickname="New User",
            avatar_url="http://example.com/avatar.jpg"
        )
        
        assert user is not None
        assert user.openid == "new_openid"
        assert user.nickname == "New User"
        assert user.avatar_url == "http://example.com/avatar.jpg"
        assert token.access_token is not None

@pytest.mark.asyncio
async def test_authenticate_user_existing(db, test_user):
    """测试已存在用户认证"""
    with patch('app.services.auth.get_openid_and_session_key') as mock_get:
        mock_get.return_value = (test_user.openid, "session_key")
        
        user, token = await authenticate_user(
            db=db,
            code="test_code"
        )
        
        assert user.id == test_user.id
        assert user.openid == test_user.openid
        assert token.access_token is not None

@pytest.mark.asyncio
async def test_authenticate_user_wechat_error(db):
    """测试微信接口错误"""
    with patch('app.services.auth.get_openid_and_session_key') as mock_get:
        mock_get.side_effect = WeChatError("WeChat API error")
        
        with pytest.raises(WeChatError):
            await authenticate_user(
                db=db,
                code="invalid_code"
            )

def test_get_user_by_id(db, test_user):
    """测试通过ID获取用户"""
    user = get_user_by_id(db, test_user.id)
    assert user is not None
    assert user.id == test_user.id

def test_get_user_by_id_not_found(db):
    """测试获取不存在的用户ID"""
    user = get_user_by_id(db, 999)
    assert user is None

def test_get_user_by_openid(db, test_user):
    """测试通过openid获取用户"""
    user = get_user_by_openid(db, test_user.openid)
    assert user is not None
    assert user.openid == test_user.openid

def test_get_user_by_openid_not_found(db):
    """测试获取不存在的openid"""
    user = get_user_by_openid(db, "non_existent_openid")
    assert user is None 