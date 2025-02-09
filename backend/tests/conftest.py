import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models.user import User

# 创建内存数据库
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db():
    # 创建数据库表
    Base.metadata.create_all(bind=engine)
    
    # 创建会话
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # 清理数据库
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db):
    """每个测试函数使用独立的数据库会话"""
    Base.metadata.create_all(bind=engine)
    try:
        yield db
    finally:
        db.rollback()  # 首先回滚任何未提交的更改
        # 清理所有表数据
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.commit()  # 提交删除操作
        db.close()  # 确保关闭会话

@pytest.fixture(scope="session")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session):
    """创建测试用户"""
    import uuid
    
    user = User(
        openid=f"test_openid_{uuid.uuid4().hex[:8]}",  # 使用 UUID 生成唯一的 openid
        nickname="Test User",
        avatar_url="http://example.com/avatar.jpg",
        email="test@example.com",
        phone="13800138000",
        bio="Test user bio"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user 