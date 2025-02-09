import pytest
from unittest.mock import patch
from fastapi import status
from app.core.security.jwt import create_access_token

def test_login(client):
    """测试登录接口"""
    with patch('app.services.auth.get_openid_and_session_key') as mock_get:
        mock_get.return_value = ("test_openid", "session_key")
        
        response = client.post(
            "/api/v1/auth/login",
            json={
                "code": "test_code",
                "nickname": "Test User",
                "avatar_url": "http://example.com/avatar.jpg"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

def test_login_invalid_code(client):
    """测试无效的登录码"""
    with patch('app.services.auth.get_openid_and_session_key') as mock_get:
        mock_get.side_effect = Exception("Invalid code")
        
        response = client.post(
            "/api/v1/auth/login",
            json={"code": "invalid_code"}
        )
        
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

def test_get_current_user(client, test_user):
    """测试获取当前用户信息"""
    token = create_access_token({"sub": str(test_user.id), "openid": test_user.openid})
    
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_user.id
    assert data["openid"] == test_user.openid

def test_get_current_user_invalid_token(client):
    """测试无效的令牌"""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid_token"}
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_update_user_info(client, test_user):
    """测试更新用户信息"""
    token = create_access_token({"sub": str(test_user.id), "openid": test_user.openid})
    
    response = client.put(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nickname": "Updated Name",
            "bio": "Updated bio"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["nickname"] == "Updated Name"

def test_update_user_info_duplicate_email(client, test_user, db_session):
    """测试更新重复的邮箱"""
    # 创建另一个用户
    from app.models.user import User
    other_user = User(
        openid="other_openid",
        email="other@example.com"
    )
    db_session.add(other_user)
    db_session.commit()
    
    token = create_access_token({"sub": str(test_user.id), "openid": test_user.openid})
    
    response = client.put(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"email": "other@example.com"}
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST

def test_deactivate_account(client, test_user):
    """测试注销账号"""
    token = create_access_token({"sub": str(test_user.id), "openid": test_user.openid})
    
    response = client.delete(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == status.HTTP_204_NO_CONTENT 