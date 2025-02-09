import requests
from typing import Optional, Tuple
from app.core.config import settings

class WeChatError(Exception):
    """微信接口错误"""
    pass

def get_openid_and_session_key(code: str) -> Tuple[str, str]:
    """
    通过微信登录code获取openid和session_key
    """
    url = "https://api.weixin.qq.com/sns/jscode2session"
    params = {
        "appid": settings.WECHAT_APP_ID,
        "secret": settings.WECHAT_APP_SECRET,
        "js_code": code,
        "grant_type": "authorization_code"
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if "errcode" in data:
            raise WeChatError(f"WeChat API error: {data}")
            
        return data["openid"], data["session_key"]
    except Exception as e:
        raise WeChatError(f"Failed to get openid: {str(e)}")

def verify_user_info(session_key: str, raw_data: str, signature: str) -> bool:
    """
    验证用户信息的签名
    """
    # TODO: 实现签名验证
    return True 