# 🐳 Docker部署指南

## 🎯 为什么使用Docker？

### 完美解决的问题

```
✅ 数据持久化 - Volume自动挂载，重启不丢失
✅ 环境一致 - 本地、Railway、生产环境完全相同
✅ 部署简单 - 一条命令启动
✅ 隔离性好 - 不影响系统环境
✅ 易于扩展 - 可添加数据库、Redis等
```

---

## 🚀 快速开始

### 方法1：使用Docker Compose（推荐）

```bash
# 1. 构建并启动
docker-compose up -d

# 2. 查看日志
docker-compose logs -f

# 3. 访问
http://localhost:8080
```

### 方法2：使用Docker命令

```bash
# 1. 构建镜像
docker build -t lovenote:latest .

# 2. 运行容器
docker run -d \
  --name lovenote \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/data-backups:/app/data-backups \
  -v $(pwd)/logs:/app/logs \
  -e ADMIN_PASSWORD=200269 \
  --restart unless-stopped \
  lovenote:latest

# 3. 查看日志
docker logs -f lovenote
```

---

## 📊 数据持久化

### Volume挂载

```yaml
volumes:
  - ./data:/app/data              # 用户和消息数据
  - ./data-backups:/app/data-backups  # 自动备份
  - ./logs:/app/logs              # 日志文件
```

**效果：**
- ✅ 容器重启数据不丢失
- ✅ 容器删除数据保留
- ✅ 可以直接访问本地文件
- ✅ 备份简单（复制文件夹）

---

## 🛠️ 常用命令

### 启动和停止

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 停止但保留容器
docker-compose stop

# 启动已存在的容器
docker-compose start
```

### 查看状态

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看资源使用
docker stats lovenote

# 进入容器
docker exec -it lovenote sh
```

### 数据管理

```bash
# 备份数据
tar -czf lovenote-backup-$(date +%Y%m%d).tar.gz data/ data-backups/

# 恢复数据
tar -xzf lovenote-backup-20251122.tar.gz

# 查看数据
cat data/users.json
cat data/notes.json
```

---

## 🔄 更新应用

### 方法1：重新构建

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建并启动
docker-compose up -d --build
```

### 方法2：更新镜像

```bash
# 1. 停止容器
docker-compose down

# 2. 删除旧镜像
docker rmi lovenote:latest

# 3. 重新构建
docker-compose build

# 4. 启动
docker-compose up -d
```

**数据自动保留！** ✅

---

## 🌐 Railway部署Docker

### Dockerfile已优化

Railway会自动检测Dockerfile并使用它部署：

```bash
# 1. 推送到GitHub
git push origin main

# 2. Railway自动检测Dockerfile
# 3. 自动构建和部署
# 4. 使用相同的Docker环境 ✅
```

### Railway Volume配置

虽然Railway可能没有Volume选项，但Docker镜像会：
- ✅ 自动初始化管理员（src/init-admin.js）
- ✅ 接收定时同步数据
- ✅ 环境完全一致

---

## 🔧 高级配置

### 添加环境变量

编辑 `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=8080
  - ADMIN_PASSWORD=200269
  - AUTO_CREATE_ADMIN=true
  - MAX_BACKUPS=15
```

### 添加数据库

取消 `docker-compose.yml` 中的PostgreSQL注释：

```yaml
services:
  lovenote:
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://lovenote:password@postgres:5432/lovenote
  
  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 配置Nginx反向代理

```yaml
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - lovenote
```

---

## 📋 健康检查

### 自动健康检查

Dockerfile已配置健康检查：

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:8080', ...)"
```

### 查看健康状态

```bash
# 查看健康状态
docker ps

# 输出示例
CONTAINER ID   STATUS
abc123         Up 2 hours (healthy)
```

---

## 🔍 监控和日志

### 查看实时日志

```bash
# 所有日志
docker-compose logs -f

# 最近100行
docker-compose logs --tail=100

# 特定时间
docker-compose logs --since 30m
```

### 日志文件

```bash
# 应用日志（挂载的volume）
tail -f logs/railway-sync.log

# Docker日志
docker logs lovenote
```

---

## 🆘 故障排除

### 容器无法启动

```bash
# 查看日志
docker-compose logs

# 检查配置
docker-compose config

# 删除并重新创建
docker-compose down
docker-compose up -d
```

### 端口冲突

```bash
# 检查端口占用
lsof -ti:8080

# 修改端口（docker-compose.yml）
ports:
  - "8081:8080"  # 使用8081端口
```

### 数据丢失

```bash
# 检查volume挂载
docker inspect lovenote | grep -A 10 Mounts

# 验证数据存在
ls -la data/
```

---

## ✅ 最佳实践

### 1. 定期备份

```bash
# 创建备份脚本
cat > backup-docker.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backups/lovenote-$DATE.tar.gz data/ data-backups/ logs/
echo "✅ 备份完成: backups/lovenote-$DATE.tar.gz"
EOF

chmod +x backup-docker.sh

# 定时备份
crontab -e
# 每天凌晨2点
0 2 * * * /path/to/backup-docker.sh
```

### 2. 资源限制

```yaml
services:
  lovenote:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          memory: 256M
```

### 3. 日志轮转

```yaml
services:
  lovenote:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🎯 Docker vs 传统部署

| 特性 | Docker | 传统 |
|------|--------|------|
| **数据持久化** | ✅ Volume自动 | ⚠️ 需手动配置 |
| **环境一致** | ✅ 完全相同 | ⚠️ 可能不同 |
| **部署速度** | ✅ 秒级 | ⚠️ 分钟级 |
| **隔离性** | ✅ 完全隔离 | ❌ 共享环境 |
| **扩展性** | ✅ 易于扩展 | ⚠️ 需要配置 |
| **回滚** | ✅ 秒级回滚 | ⚠️ 手动回滚 |

---

## 🚀 生产环境部署

### 推荐配置

```yaml
version: '3.8'

services:
  lovenote:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - lovenote_data:/app/data
      - lovenote_backups:/app/data-backups
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 2  # 双实例
      resources:
        limits:
          cpus: '1'
          memory: 512M
    restart: always

volumes:
  lovenote_data:
  lovenote_backups:
```

---

## 📊 总结

### Docker优势

```
✅ 数据持久化问题 → 完全解决
✅ 环境一致性 → 完美保证
✅ 部署复杂度 → 极大简化
✅ Railway同步 → 自动继续
✅ 扩展能力 → 显著提升
```

### 立即开始

```bash
# 1. 启动Docker服务
docker-compose up -d

# 2. 查看状态
docker-compose ps

# 3. 访问应用
http://localhost:8080

# 4. 享受Docker带来的便利！ 🎉
```

---

*最后更新: 2025-11-22*  
*版本: v1.2*  
*Docker化完成！* 🐳✨
