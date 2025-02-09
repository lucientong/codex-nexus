# Codex Nexus (藏书云廊)

## 项目简介
Codex Nexus 是一款个人书房藏品管理微信小程序，支持藏书、杂志、CD、黑胶、DVD的数字化管理，兼具线上分享、借阅、阅读记录及社交互动功能。

## 技术栈
- 前端：微信小程序原生框架
- 后端：Python FastAPI
- 数据库：MySQL
- 缓存：Redis
- 对象存储：腾讯云 COS

## 目录结构
```
project/
├── backend/            # 后端项目
│   ├── app/           # 应用代码
│   ├── locales/       # 多语言文件
│   ├── tests/         # 测试文件
│   └── alembic/       # 数据库迁移
├── miniprogram/       # 小程序前端
│   ├── pages/         # 页面文件
│   ├── components/    # 组件
│   ├── services/      # 服务
│   ├── utils/         # 工具函数
│   └── locales/       # 多语言文件
└── docs/              # 项目文档
```

## 开发环境搭建

### 后端环境配置
1. 创建虚拟环境：
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. 安装依赖：
```bash
cd backend
pip install -r requirements.txt
```

3. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，填入实际配置
```

4. 初始化数据库：
```bash
alembic upgrade head
```

5. 启动服务：
```bash
uvicorn app.main:app --reload
```

### 小程序开发环境
1. 安装微信开发者工具
2. 导入项目
3. 填入小程序 AppID

## API 文档
启动后端服务后，访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 测试
```bash
cd backend
pytest
```

## 部署
详见 [部署文档](docs/deployment.md)

## 贡献指南
详见 [贡献指南](docs/CONTRIBUTING.md)

## 许可证
MIT License
