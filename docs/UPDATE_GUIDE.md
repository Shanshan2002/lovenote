# 📘 更新指南 - 数据永不丢失

## 🎯 核心原则

**您的用户数据和消息永远不会因为GitHub更新而丢失！**

原因：
- ✅ `data/` 目录在 `.gitignore` 中
- ✅ 数据只保存在本地
- ✅ GitHub 更新不会覆盖本地数据

---

## 🔄 安全更新流程

### 使用自动化脚本（推荐）

```bash
./scripts/safe-update.sh
```

这个脚本会自动：
1. ✅ 备份当前数据
2. ✅ 导出数据副本
3. ✅ 从GitHub拉取更新
4. ✅ 保留所有用户和消息
5. ✅ 更新依赖
6. ✅ 重启服务器（如果需要）
7. ✅ 验证数据完整性

---

## 📋 手动更新步骤

如果您想手动更新：

### 步骤 1：备份数据
```bash
./scripts/backup-data.sh
```

### 步骤 2：拉取更新
```bash
git pull origin main
```

### 步骤 3：安装依赖（如果有变化）
```bash
npm install
```

### 步骤 4：重启服务器
```bash
# 停止当前服务器 (Ctrl+C)
npm start
```

**数据自动保留！** 因为 `data/` 不在Git追踪中。

---

## 🛡️ 数据保护机制

### 自动保护
- 📁 `data/users.json` - 不在Git中
- 📁 `data/notes.json` - 不在Git中
- 📁 `data-backups/` - 不在Git中
- ✅ Git更新不会影响这些文件

### 实时备份
每次重要操作都会自动创建备份：
- 用户注册 → 自动备份
- 消息发送 → 自动备份
- 用户删除 → 自动备份

### 手动备份
```bash
# 创建备份
./scripts/backup-data.sh

# 导出数据（用于迁移）
./scripts/export-data.sh
```

---

## 📊 当前数据状态

查看当前用户和消息：

```bash
python3 << 'EOF'
import json

with open('data/users.json', 'r') as f:
    users = json.load(f)
with open('data/notes.json', 'r') as f:
    notes = json.load(f)

print(f"用户数: {len(users)}")
print(f"消息数: {len(notes)}")

for user in users:
    role = "👑" if user.get('isAdmin') else "👤"
    print(f"{role} {user['username']}")
EOF
```

---

## 🔧 无缝更新（不中断服务）

### 方法 1：使用PM2（推荐生产环境）

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start src/server.js --name lovenote

# 更新时
git pull origin main
npm install
pm2 reload lovenote  # 零停机重启
```

### 方法 2：双服务器切换

```bash
# 在另一个端口启动新版本
PORT=8081 npm start &

# 测试新版本
curl http://localhost:8081/api/users

# 确认正常后，停止旧版本
lsof -ti:8080 | xargs kill -9

# 切换到标准端口
# 重启新版本在8080端口
```

---

## 🆘 数据恢复

### 从备份恢复

```bash
# 查看所有备份
ls -lt data-backups/

# 恢复最新备份
./scripts/restore-data.sh
# 选择 1（最新备份）
```

### 从导出文件恢复

```bash
# 导入之前导出的数据
./scripts/import-data.sh data-export-TIMESTAMP/
```

---

## ✅ 更新检查清单

更新后验证：

- [ ] 服务器正常启动
- [ ] 可以登录现有账户
- [ ] 用户数据完整
- [ ] 历史消息保留
- [ ] 新功能正常工作

```bash
# 快速验证
./tests/test-suite.sh
```

---

## 📝 最佳实践

### 每次更新前

```bash
# 1. 备份
./scripts/backup-data.sh

# 2. 导出（可选，额外保险）
./scripts/export-data.sh

# 3. 更新
./scripts/safe-update.sh
```

### 定期维护

```bash
# 每周创建一次手动备份
./scripts/backup-data.sh

# 每月导出一次数据（保存到安全位置）
./scripts/export-data.sh
```

---

## 🔐 数据安全保证

### 多层保护

1. **实时文件存储** - 立即写入磁盘
2. **自动备份** - 重要操作触发
3. **手动备份** - 随时可用
4. **导出功能** - 便于迁移
5. **Git保护** - data/不被追踪

### 数据不会丢失的原因

```
✅ Git更新只更新代码文件
✅ data/在.gitignore中
✅ 本地数据不受影响
✅ 每次操作都有备份
✅ 导出功能随时可用
```

---

## 🎯 常见场景

### 场景 1：日常代码更新
```bash
git pull origin main
# 数据自动保留，无需任何操作
```

### 场景 2：更换电脑
```bash
# 旧电脑
./scripts/export-data.sh
# 复制 data-export-* 文件夹

# 新电脑
git clone https://github.com/Shanshan2002/lovenote
cd lovenote
npm install
./scripts/import-data.sh /path/to/data-export-*/
npm start
```

### 场景 3：数据损坏
```bash
./scripts/restore-data.sh
# 选择最近的备份
```

---

## 📞 需要帮助？

如果遇到问题：

1. 查看 `docs/TROUBLESHOOTING.md`
2. 运行测试：`./tests/test-suite.sh`
3. 检查备份：`ls -lt data-backups/`

---

**记住：您的数据永远安全！** 🔒✨

---

*最后更新: 2025-11-21*  
*版本: v1.2*
