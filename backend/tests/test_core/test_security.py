from datetime import timedelta
import pytest
from app.core.security.jwt import create_access_token, verify_token

def test_create_access_token():
    """测试创建访问令牌"""
    data = {"sub": "1", "openid": "test_openid"}
    token = create_access_token(data)
    assert token is not None
    assert isinstance(token, str)

def test_create_access_token_with_expires():
    """测试创建带过期时间的访问令牌"""
    data = {"sub": "1", "openid": "test_openid"}
    expires = timedelta(minutes=15)
    token = create_access_token(data, expires)
    assert token is not None
    assert isinstance(token, str)

def test_verify_token():
    """测试验证令牌"""
    data = {"sub": "1", "openid": "test_openid"}
    token = create_access_token(data)
    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == "1"
    assert payload["openid"] == "test_openid"

def test_verify_invalid_token():
    """测试验证无效令牌"""
    payload = verify_token("invalid_token")
    assert payload is None 