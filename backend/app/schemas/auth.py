from pydantic import BaseModel, Field, EmailStr, ConfigDict

class WeChatLoginRequest(BaseModel):
    """微信登录请求"""
    code: str = Field(..., description="微信登录code")
    nickname: str = Field(None, description="用户昵称")
    avatar_url: str = Field(None, description="头像URL")
    raw_data: str = Field(None, description="原始数据")
    signature: str = Field(None, description="签名")

class Token(BaseModel):
    """令牌"""
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """令牌数据"""
    user_id: int
    openid: str

class UserInfo(BaseModel):
    """用户信息"""
    id: int
    openid: str
    nickname: str | None = None
    avatar_url: str | None = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class UserUpdateRequest(BaseModel):
    """用户信息更新请求"""
    nickname: str | None = Field(None, description="用户昵称", min_length=2, max_length=32)
    avatar_url: str | None = Field(None, description="头像URL", max_length=255)
    email: EmailStr | None = Field(None, description="电子邮箱")
    phone: str | None = Field(None, description="手机号码", pattern=r"^1[3-9]\d{9}$")
    bio: str | None = Field(None, description="个人简介", max_length=500) 