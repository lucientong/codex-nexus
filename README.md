# 藏书云廊 (Codex Nexus)

一款个人藏品管理微信小程序，帮助你高效管理书籍、CD、黑胶唱片等实体收藏品。

## 🌟 功能特性

### MVP 版本

- ✅ **多书房管理** - 创建多个主题书房，分类管理不同收藏
- ✅ **智能录入** - 扫码识别 ISBN/条形码，连续扫码批量添加
- ✅ **搜索录入** - 按书名、作者、ISBN 搜索外部数据源
- ✅ **手动录入** - 完整表单支持自定义录入
- ✅ **书架视图** - 拟物化书架/唱片架展示
- ✅ **列表视图** - 支持多维度排序和筛选
- ✅ **数据统计** - 分类饼图、趋势分析、排行榜

### 规划中功能

- ⏳ 借阅管理 - 好友借阅申请与审批
- ⏳ 阅读记录 - 时间线式阅读笔记
- ⏳ 社交分享 - 分享书房给好友

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Taro 3.6 + React 18 + TypeScript |
| UI 组件 | TDesign 小程序版 + 自定义组件 |
| 状态管理 | Zustand |
| 后端服务 | 腾讯云开发 CloudBase |
| 数据库 | 云开发数据库 (MongoDB) |
| 存储 | 云开发存储 (COS) |
| 数据源 | Open Library / Discogs / MusicBrainz |

## 📦 项目结构

```
codex-nexus/
├── src/
│   ├── pages/              # 页面
│   │   ├── index/          # 首页（书房列表）
│   │   ├── library/        # 书房详情
│   │   ├── item-detail/    # 藏品详情
│   │   ├── add-item/       # 录入页面
│   │   ├── statistics/     # 统计页面
│   │   └── profile/        # 我的页面
│   ├── components/         # 组件
│   ├── stores/             # Zustand 状态
│   ├── services/           # API 服务
│   ├── types/              # TypeScript 类型
│   ├── utils/              # 工具函数
│   └── constants/          # 常量配置
├── cloud/
│   ├── functions/          # 云函数
│   │   ├── user-service/
│   │   ├── library-service/
│   │   ├── item-service/
│   │   └── external-api/
│   └── database/           # 数据库配置
├── .env.development        # 开发环境配置
├── .env.production         # 生产环境配置
└── project.config.json     # 小程序配置
```

## 🚀 快速开始

### 1. 环境准备

- Node.js 18+
- 微信开发者工具（最新版）
- 腾讯云账号

### 2. 安装依赖

```bash
cd codex-nexus
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.development`：

```bash
cp .env.example .env.development
```

编辑 `.env.development`，填入你的云开发环境 ID：

```env
TARO_APP_CLOUD_ENV=your-cloud-env-id
TARO_APP_APPID=your-mini-program-appid
```

### 4. 配置小程序

编辑 `project.private.config.json`，填入你的 AppID：

```json
{
  "appid": "你的小程序 AppID"
}
```

### 5. 开通云开发

1. 打开微信开发者工具
2. 导入项目
3. 点击「云开发」开通服务
4. 记录环境 ID 填入配置文件

### 6. 部署云函数

在微信开发者工具中，右键点击 `cloud/functions` 下的每个函数目录，选择「上传并部署：云端安装依赖」

### 7. 创建数据库集合

在云开发控制台创建以下集合：

- `users` - 用户信息
- `libraries` - 书房
- `items` - 藏品

### 8. 启动开发

```bash
npm run dev:weapp
```

## 🔧 开发命令

```bash
# 开发模式
npm run dev:weapp

# 生产构建
npm run build:weapp

# 代码检查
npm run lint
```

## 🔑 外部 API 配置（可选）

如需使用 Discogs API 搜索 CD/黑胶信息：

1. 访问 [Discogs Developers](https://www.discogs.com/developers)
2. 注册并创建应用
3. 将 Consumer Key/Secret 填入 `.env` 文件

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
