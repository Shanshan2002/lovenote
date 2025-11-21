# 🔄 数据同步指南

## 🎯 本地与Railway数据同步

### 快速同步方案

---

## 🚀 方法1：初始化Railway管理员（推荐）

### 一键创建Shanshan管理员账户

```bash
./scripts/init-railway-admin.sh
```

**自动完成：**
- ✅ 在Railway创建Shanshan账户
- ✅ 密码：200269
- ✅ 自动成为管理员（第一个用户）
- ✅ 验证登录

**完成后：**
1. 访问：https://lovenote-production.up.railway.app/
2. 登录：Shanshan / 200269
3. 开始使用！

---

## 📤 方法2：同步所有用户到Railway

### 批量同步本地用户

```bash
./scripts/sync-to-railway.sh
```

**功能：**
- 读取本地所有用户
- 在Railway注册相同账户
- 保持密码一致

**注意：**
- ⚠️ 会覆盖Railway数据
- ✅ 本地数据不变
- ⏱️ 需要确认操作

---

## 🔄 方法3：手动保持同步

### 同步流程

#### 步骤1：导出本地数据
```bash
./scripts/export-data.sh
```

#### 步骤2：查看用户列表
```bash
cat data/users.json
```

#### 步骤3：在Railway逐个注册
访问 Railway 网站，手动注册每个用户

#### 步骤4：验证同步
检查两边用户数量是否一致

---

## 🎯 无缝使用策略

### 策略A：Railway为主（推荐生产环境）

```
Railway (生产)
  ↓ 所有用户使用
  ↓ 数据永久保存
  ↓ 配置持久化卷

本地 (开发测试)
  ↓ 开发新功能
  ↓ 测试更新
  ↓ 推送到GitHub → Railway自动部署
```

### 策略B：本地为主（推荐个人使用）

```
本地 (主要使用)
  ↓ 日常使用
  ↓ 自动备份
  ↓ 数据完整

Railway (备用/分享)
  ↓ 需要时创建账户
  ↓ 偶尔使用
```

### 策略C：双环境并行

```
本地          Railway
  ↓             ↓
开发环境      生产环境
  ↓             ↓
测试          正式使用
  ↓             ↓
推送GitHub
      ↓
   自动部署到Railway
```

---

## 📊 数据流向说明

### 当前架构

```
┌─────────────────┐
│   本地开发      │
│ localhost:8080  │
│                 │
│ data/           │
│ ├─ users.json   │ ← 本地独立
│ └─ notes.json   │ ← 本地独立
└─────────────────┘
        ↓
   (代码推送)
        ↓
┌─────────────────┐
│    GitHub       │
│  (只有代码)     │ ← 数据不上传
└─────────────────┘
        ↓
   (自动部署)
        ↓
┌─────────────────┐
│    Railway      │
│ railway.app     │
│                 │
│ /app/data/      │
│ ├─ users.json   │ ← Railway独立
│ └─ notes.json   │ ← Railway独立
└─────────────────┘
```

### 为什么数据不自动同步？

**原因：**
1. ✅ **安全性** - 敏感数据不应该通过GitHub传输
2. ✅ **独立性** - 开发和生产环境应该分离
3. ✅ **隐私性** - 用户数据保护

**好处：**
- 本地测试不影响生产
- 生产数据更安全
- 符合最佳实践

---

## 🛠️ 实现完全同步（高级）

如果确实需要完全同步，可以：

### 选项1：使用共享数据库

```bash
# 在Railway配置PostgreSQL
# 本地连接相同数据库
# 实现真正的数据同步
```

### 选项2：API同步

创建同步服务：
- 本地更改 → API推送到Railway
- Railway更改 → Webhook通知本地

### 选项3：定时同步脚本

```bash
# 每小时同步一次
crontab -e
0 * * * * /path/to/sync-script.sh
```

---

## 📋 推荐方案

### 对于您的情况

**最简单的方案：**

```bash
# 1. 初始化Railway
./scripts/init-railway-admin.sh

# 2. 访问Railway
https://lovenote-production.up.railway.app/

# 3. 登录
用户名: Shanshan
密码: 200269

# 4. 开始使用
```

**本地和Railway各自维护数据，需要时手动同步。**

---

## ✅ 同步检查清单

### Railway初始化
- [ ] 运行 `init-railway-admin.sh`
- [ ] Shanshan账户创建成功
- [ ] 可以登录Railway
- [ ] 确认管理员权限

### 数据对比
- [ ] 检查本地用户数
- [ ] 检查Railway用户数
- [ ] 确认关键账户存在
- [ ] 测试登录功能

### 日常使用
- [ ] 确定主要使用环境
- [ ] 定期检查两边状态
- [ ] 需要时手动同步

---

## 🎯 快速参考

### 常用命令

```bash
# 初始化Railway管理员
./scripts/init-railway-admin.sh

# 同步所有用户到Railway
./scripts/sync-to-railway.sh

# 查看本地用户
cat data/users.json

# 导出数据
./scripts/export-data.sh

# 部署到Railway
./scripts/deploy-to-railway.sh
```

### URL参考

```
本地:    http://localhost:8080
Railway: https://lovenote-production.up.railway.app/
GitHub:  https://github.com/Shanshan2002/lovenote
```

---

## 💡 最佳实践

1. **开发在本地** - 使用本地环境开发和测试
2. **生产用Railway** - 正式使用Railway环境
3. **定期备份** - 两边都要定期备份
4. **手动同步** - 需要时运行同步脚本
5. **文档记录** - 记录两边的用户和数据

---

*最后更新: 2025-11-21*  
*版本: v1.2*
