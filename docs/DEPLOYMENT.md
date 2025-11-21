# 部署 Lovenote 到 lovenote.app

## 方案一：使用 Google Cloud Run（推荐）

### 1. 准备 Dockerfile

创建 `Dockerfile`：
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 2. 部署到 Cloud Run

```bash
# 安装 gcloud CLI
# 然后运行：
gcloud run deploy lovenote \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 3. 绑定自定义域名

在 Cloud Run 控制台：
1. 选择你的服务
2. 点击 "管理自定义域"
3. 添加 `lovenote.app`
4. 按照指示配置 DNS 记录

---

## 方案二：使用 Vercel

### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

### 2. 部署

```bash
vercel
```

### 3. 添加域名

```bash
vercel domains add lovenote.app
```

---

## 方案三：使用传统 VPS（DigitalOcean, AWS EC2等）

### 1. 在服务器上安装依赖

```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

### 2. 上传代码并启动

```bash
# 在项目目录
npm install
pm2 start server.js --name lovenote
pm2 startup
pm2 save
```

### 3. 配置 Nginx

```nginx
server {
    listen 80;
    server_name lovenote.app www.lovenote.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 配置 SSL（Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d lovenote.app -d www.lovenote.app
```

---

## 购买域名

### 推荐域名注册商：
- **Namecheap** - 便宜、界面友好
- **GoDaddy** - 知名度高
- **Google Domains** - 简单易用
- **Cloudflare** - 自带 CDN

### DNS 配置示例：

| 类型 | 名称 | 值 | TTL |
|------|------|-----|-----|
| A | @ | your-server-ip | 3600 |
| A | www | your-server-ip | 3600 |

或使用 CNAME（如果部署到 Cloud Run）：
| 类型 | 名称 | 值 | TTL |
|------|------|-----|-----|
| CNAME | @ | your-app.run.app | 3600 |

---

## 当前配置

代码已经配置为：
- ✅ 本地开发：`http://localhost:3000`
- ✅ 生产环境：自动检测域名

当你部署到 `lovenote.app` 后，应用会自动使用正确的 API 地址！

---

## 快速测试

在本地测试域名行为：
```bash
# 编辑 /etc/hosts（Mac/Linux）或 C:\Windows\System32\drivers\etc\hosts（Windows）
# 添加：
127.0.0.1 lovenote.app

# 然后访问 http://lovenote.app:3000
```

这样可以在本地模拟真实域名环境！
