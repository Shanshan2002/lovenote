# Docker 配置文件（已归档）

## 📦 目录说明

此目录存放Docker相关配置文件，暂时不使用。

## 📁 包含文件

- `Dockerfile` - Docker镜像构建文件
- `docker-compose.yml` - Docker Compose配置
- `.dockerignore` - Docker构建时忽略的文件

## 💡 何时使用

如果将来需要使用Docker部署，可以将这些文件移回项目根目录：

```bash
# 恢复Docker配置
cp archived/docker/Dockerfile .
cp archived/docker/docker-compose.yml .
cp archived/docker/.dockerignore .
```

## 📚 相关文档

- `docs/DOCKER_GUIDE.md` - Docker完整使用指南

## ⚙️ 当前部署方式

项目当前使用以下方式部署：

### 本地开发
```bash
npm start
# 访问 http://localhost:8080
```

### Railway部署
- 直接从GitHub自动部署
- 无需Docker
- 使用railway.toml配置

### 特点
✅ 更简单
✅ 无需Docker环境
✅ 自动化部署
✅ 免费额度更多

## 📝 备注

- Docker配置完整且可用
- 仅为简化当前工作流而归档
- 需要时可随时恢复使用

---

*归档时间: 2025-11-22*  
*原因: 简化项目结构，当前不使用Docker*
