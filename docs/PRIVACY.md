# 隐私与数据保护

## 🔒 数据保护机制

### 本地数据保护

所有用户数据和隐私信息都**不会**被提交到 Git 或 GitHub：

```
✅ data/users.json     - 用户账户信息（包括密码）
✅ data/notes.json     - 消息内容
✅ data-backups/       - 所有数据备份
✅ .env                - 环境变量和配置
```

### .gitignore 保护

项目使用 `.gitignore` 文件防止敏感数据被追踪：

```gitignore
data/              # 用户数据目录
data-backups/      # 备份目录
.env*              # 环境变量文件
*.pem, *.key       # 证书和密钥文件
secrets/           # 密钥目录
```

---

## 🛡️ 安全最佳实践

### 1. 密码安全

**当前状态：**
- ⚠️ 密码以明文存储在 `data/users.json`
- 📝 仅用于开发和个人使用

**生产环境建议：**
- 使用 bcrypt 加密密码
- 使用环境变量存储密钥
- 定期更新密码

### 2. 数据备份

**本地备份：**
```bash
./backup-data.sh
```

**备份位置：**
- `data-backups/` - 本地备份（不会上传到 GitHub）

**恢复数据：**
```bash
cp data-backups/backup_YYYYMMDD_HHMMSS/*.json data/
```

### 3. GitHub 仓库设置

**强烈建议：**
- ✅ 设置仓库为 **Private**（私有）
- ✅ 不要在公开仓库中分享代码
- ✅ 定期检查 .gitignore 配置

---

## 🚨 紧急措施

### 如果意外提交了敏感数据：

1. **立即从 Git 历史中删除：**
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch data/users.json" \
  --prune-empty --tag-name-filter cat -- --all
```

2. **强制推送：**
```bash
git push origin --force --all
```

3. **更改所有密码**

---

## ✅ 验证数据安全

### 检查是否有敏感数据被追踪：

```bash
# 检查 Git 追踪的文件
git ls-files | grep -E "(data/|\.env)"

# 应该没有输出，如果有输出表示有问题
```

### 检查 GitHub 仓库：

```bash
# 查看远程仓库 URL
git remote -v

# 检查仓库可见性（在 GitHub 网站上）
```

---

## 📞 支持

如有数据隐私问题，请：
1. 检查 `.gitignore` 文件
2. 运行 `git status --ignored` 查看被忽略的文件
3. 确认 GitHub 仓库设置为私有

---

## 📝 更新日志

- 2024-11-21: 创建隐私保护文档
- 2024-11-21: 增强 .gitignore 配置
- 2024-11-21: 添加密码保护系统
