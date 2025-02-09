from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator
from typing import Optional, Union

class Settings(BaseSettings):
    # 应用配置
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-here"
    API_V1_PREFIX: str = "/api/v1"
    
    # 数据库配置
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "codex_nexus"
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"mysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # Redis配置
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    
    # 腾讯云配置
    COS_SECRET_ID: str = "your-secret-id"
    COS_SECRET_KEY: str = "your-secret-key"
    COS_REGION: str = "ap-guangzhou"
    COS_BUCKET: str = "your-bucket-name"
    
    # JWT配置
    JWT_SECRET_KEY: str = "your-jwt-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 微信小程序配置
    WECHAT_APP_ID: str = "your-app-id"
    WECHAT_APP_SECRET: str = "your-app-secret"
    
    # 其他配置
    DEFAULT_LANGUAGE: str = "zh-CN"
    ALLOWED_HOSTS: List[str] = ["*"]
    CORS_ORIGINS: Union[List[AnyHttpUrl], List[str]] = ["http://localhost:3000"]
    
    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 