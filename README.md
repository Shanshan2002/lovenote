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

## 项目结构

```
lovenote/
├── docs/              # 📚 文档
│   ├── README.md     # 详细说明
│   ├── DEPLOYMENT.md # 部署指南
│   └── DEPLOY_RAILWAY.md
├── public/           # 🎨 前端资源
│   ├── index.html
│   ├── css/
│   │   └── pager.css
│   └── js/
│       └── pager.js
├── src/              # 💻 后端代码
│   └── server.js
└── data/             # 💾 数据存储
    ├── users.json
    └── notes.json
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
