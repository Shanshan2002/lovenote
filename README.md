# 💕 Lovenote

一个复古风格的消息传递应用，使用 Motorola 风格的寻呼机界面设计。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 开发模式（自动重启）
npm run dev
```

访问 `http://localhost:3000`

## 📂 项目结构

```
lovenote/
│
├── 📚 docs/                    文档目录
│   ├── README.md              详细功能说明
│   ├── DEPLOYMENT.md          通用部署指南
│   ├── DEPLOY_RAILWAY.md      Railway部署（推荐）
│   └── VERCEL_SETUP.md        Vercel配置（可选）
│
├── 🎨 public/                  前端静态资源
│   ├── index.html             主页面
│   ├── css/
│   │   └── pager.css          寻呼机样式
│   └── js/
│       └── pager.js           前端逻辑
│
├── 💻 src/                     后端源代码
│   └── server.js              Express服务器 + API
│
├── 💾 data/                    数据存储（自动生成）
│   ├── users.json             用户数据
│   └── notes.json             消息数据
│
├── 📦 package.json             项目配置
└── 📄 README.md                本文件
```

## 功能特性

- 📟 **复古寻呼机界面** - 90年代 Motorola 寻呼机设计
- 💌 **消息卡片** - 可拖拽的浮动消息卡片
- ⌨️ **打字机动画** - 逐字符显示效果与打字音效
- 🎨 **绿色 LCD 屏幕** - 经典单色 LCD 显示
- 🔔 **实时通知** - LED 闪烁与提示音

## 技术栈

- **前端**: HTML5, CSS3, Vanilla JavaScript
- **后端**: Node.js, Express.js
- **数据**: 文件系统 JSON 存储

## 部署

查看 [部署指南](docs/DEPLOYMENT.md) 了解如何部署到：
- Railway（推荐）
- Vercel
- Google Cloud Run

## 许可

ISC
