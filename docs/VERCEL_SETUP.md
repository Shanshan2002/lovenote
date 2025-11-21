# Vercel 部署配置（可选）

⚠️ **注意**: 本项目主要部署在 **Railway** 上。这些 Vercel 配置文件仅作为备选方案保留。

## 为什么不推荐 Vercel？

Vercel 使用 Serverless 架构，有以下限制：
- ❌ 文件存储不持久化（每次重启数据丢失）
- ❌ 不支持长期运行的服务器
- ⚠️ 需要外部数据库才能正常工作

**推荐使用 Railway** - 查看 [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md)

---

## 如何使用 Vercel 部署（需要配置数据库）

### 1. 复制配置文件到根目录

```bash
cp docs/vercel.json.example vercel.json
cp -r docs/vercel-api api
```

### 2. 配置外部数据库

你需要：
- MongoDB Atlas / PostgreSQL / MySQL
- 修改 `src/server.js` 使用数据库而非 JSON 文件

### 3. 部署

```bash
npm i -g vercel
vercel
```

### 配置文件说明

**vercel.json.example**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

**vercel-api/server.js**
- Vercel serverless function wrapper
- 指向主服务器文件

---

## 推荐方案对比

| 特性 | Railway | Vercel |
|------|---------|--------|
| 文件持久化 | ✅ | ❌ |
| 长期运行 | ✅ | ❌ |
| JSON 存储 | ✅ | ❌ |
| 配置难度 | 简单 | 需要数据库 |
| 免费额度 | $5/月 | 免费 |

**结论：使用 Railway**
