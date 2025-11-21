# 🔐 Railway持久化卷配置指南

## ⚠️ 重要：为什么数据会丢失？

### 当前问题

**没有配置持久化卷时：**
```
Railway部署 → 创建Shanshan账户 ✅
Railway重启 → 数据全部清空 ❌
再次访问  → Shanshan账户消失 ❌
```

**原因：**
Railway默认使用临时文件系统，重启后所有数据丢失！

---

## ✅ 解决方案：配置持久化卷

### 步骤详解

#### 1. 登录Railway仪表板

访问：https://railway.app/dashboard

#### 2. 进入项目设置

1. 选择你的项目：**lovenote**
2. 点击项目名称进入详情
3. 点击 **Settings** 标签

#### 3. 添加数据卷

点击 **Volumes** → **Add Volume**

**第一个卷：**
```
Name: data
Mount Path: /app/data
Size: 1GB（或更大）
```

点击 **Add Volume** 确认

**第二个卷：**
```
Name: backups
Mount Path: /app/data-backups
Size: 1GB（或更大）
```

点击 **Add Volume** 确认

#### 4. 重新部署

配置卷后，Railway会自动重新部署。

#### 5. 验证配置

部署完成后，数据将永久保存！

---

## 📊 配置前后对比

### 没有持久化卷 ❌

```
创建用户 → 保存到临时文件 → Railway重启 → 数据丢失
```

### 配置持久化卷 ✅

```
创建用户 → 保存到持久化卷 → Railway重启 → 数据保留
```

---

## 🎯 完整配置流程

### 方法A：在Railway网站配置（推荐）

```
1. 访问 Railway仪表板
   https://railway.app/dashboard

2. 选择 lovenote 项目

3. Settings → Volumes

4. 添加两个卷：
   - data (/app/data)
   - backups (/app/data-backups)

5. 等待自动重新部署

6. 完成！✅
```

### 方法B：使用Railway CLI

```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 连接项目
railway link

# 添加卷（需要在网站操作）
echo "请在Railway网站添加卷"
```

---

## ✅ 配置后验证

### 1. 检查卷是否添加

Railway仪表板 → Settings → Volumes

应该看到：
- ✅ data (/app/data)
- ✅ backups (/app/data-backups)

### 2. 测试数据持久化

```bash
# 1. 创建测试账户
访问 Railway网站
注册一个测试用户

# 2. 触发重启
Railway仪表板 → Deployments → Redeploy

# 3. 验证数据保留
重新访问网站
测试账户应该还在 ✅
```

---

## 🔄 配置后的同步策略

### 新的工作流程

```
本地数据
   ↓
定时同步脚本（每6小时）
   ↓
Railway API
   ↓
保存到持久化卷 ✅
   ↓
重启后数据依然存在 ✅
```

### 同步命令

```bash
# 立即同步到Railway
./scripts/auto-sync-railway.sh

# 配置定时同步
./scripts/setup-railway-sync.sh
```

---

## 📋 配置检查清单

完成以下步骤确保配置正确：

- [ ] 访问Railway仪表板
- [ ] 找到lovenote项目
- [ ] 进入Settings → Volumes
- [ ] 添加data卷 (/app/data)
- [ ] 添加backups卷 (/app/data-backups)
- [ ] 等待重新部署完成
- [ ] 测试创建用户
- [ ] 触发重启验证
- [ ] 确认数据保留

---

## 🎊 配置成功后

### 数据将永久保存

```
✅ 用户账户 → 永久保留
✅ 消息记录 → 永久保留
✅ Railway重启 → 数据不丢失
✅ 重新部署 → 数据不丢失
```

### 自动同步生效

```bash
# 配置定时同步（每6小时）
./scripts/setup-railway-sync.sh

# 以后：
本地新用户 → 自动同步到Railway → 永久保存 ✅
```

---

## ⚠️ 注意事项

### Railway免费层限制

```
免费层：
- ✅ 可以添加持久化卷
- ✅ 基本够用
- ⚠️ 有总使用时长限制（500小时/月）

Hobby层（$5/月）：
- ✅ 无限使用
- ✅ 持久化卷
- ✅ 更好性能
```

### 成本估算

```
免费层：$0/月
- 持久化卷：免费（有限制）
- 使用时长：500小时/月

Hobby层：$5/月
- 持久化卷：包含
- 使用时长：无限
```

---

## 🎯 快速行动

### 立即配置（5分钟）

1. **打开浏览器**
   访问：https://railway.app/dashboard

2. **选择项目**
   点击：lovenote

3. **添加卷**
   Settings → Volumes → Add Volume
   
   第一个：data, /app/data
   第二个：backups, /app/data-backups

4. **等待部署**
   约2-3分钟

5. **完成！**
   数据将永久保存 ✅

---

## 📞 需要帮助？

### 配置步骤截图

访问Railway文档：
https://docs.railway.app/reference/volumes

### 视频教程

Railway官方教程：
https://railway.app/learn

---

**完成配置后，Railway数据将永久保存，同步系统将完美工作！** 🎉

---

*最后更新: 2025-11-21*  
*重要性: ⭐⭐⭐⭐⭐*  
*必须配置！*
