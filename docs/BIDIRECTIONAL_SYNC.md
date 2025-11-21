# 🔄 双向同步指南

## 🎯 Railway ↔ 本地双向同步

### 功能说明

实现Railway和本地环境的完全互通，数据双向同步。

---

## 📊 同步架构

### 当前实现

```
本地环境
   ↓ (每小时)
   推送用户数据 → Railway
   
Railway环境
   ↑ (自动初始化)
   Shanshan账户永远存在
```

### 理想的双向同步

```
本地环境 ←→ Railway环境
   ↓           ↓
 用户/消息   用户/消息
   ↓           ↓
 自动合并    自动合并
```

---

## 🚧 当前限制

### API限制

目前的API设计主要支持**单向同步**（本地→Railway）：

1. **用户同步** ✅
   - 本地 → Railway: 完全支持
   - Railway → 本地: 受限（无法获取密码）

2. **消息同步** ⚠️
   - 需要为每个用户单独获取
   - 当前API不支持全局消息列表

---

## 💡 推荐方案

### 方案A：本地为主（推荐）⭐

**工作流程：**
```
1. 主要在本地使用和创建数据
2. 自动同步到Railway（每小时）
3. Railway作为备份和分享平台
```

**优势：**
- ✅ 完全掌控数据
- ✅ 无同步冲突
- ✅ 简单可靠

### 方案B：手动双向同步

**使用场景：**
- Railway上创建了新用户
- Railway上有新消息
- 需要合并两边数据

**操作：**
```bash
./scripts/bidirectional-sync.sh
```

### 方案C：Webhook实时同步（高级）

需要额外开发：
1. Railway发送Webhook到本地
2. 本地接收并更新数据
3. 实时双向同步

---

## 🛠️ 使用双向同步

### 脚本说明

#### 1. 从Railway拉取
```bash
./scripts/pull-from-railway.sh
```

**功能：**
- 获取Railway用户列表
- 对比本地数据
- 显示差异

**限制：**
- 无法获取密码
- 无法获取所有消息

#### 2. 双向同步
```bash
./scripts/bidirectional-sync.sh
```

**功能：**
- 拉取Railway数据
- 推送本地数据
- 创建同步快照

---

## 📋 实际使用建议

### 日常工作流

```bash
# 1. 主要在本地使用
http://localhost:8080

# 2. 自动同步到Railway（每小时）
# 无需手动操作，crontab自动执行

# 3. Railway作为分享
https://lovenote-production.up.railway.app/
```

### 特殊情况

**情况1：Railway上创建了新用户**
```bash
# 建议：在本地重新创建该用户
# 然后下次自动同步时会同步到Railway
```

**情况2：需要合并数据**
```bash
# 运行双向同步
./scripts/bidirectional-sync.sh

# 检查同步快照
ls -lt data-backups/sync_snapshot_*
```

---

## 🔍 监控同步状态

### 查看同步日志

```bash
# 本地→Railway同步日志
tail -f logs/railway-sync.log

# Railway→本地拉取日志
tail -f logs/railway-pull.log

# 双向同步日志
tail -f logs/bidirectional-sync.log
```

### 检查数据一致性

```bash
# 本地用户
cat data/users.json

# Railway用户
curl https://lovenote-production.up.railway.app/api/users

# 对比
python3 << 'EOF'
import json
import requests

local = json.load(open('data/users.json'))
remote = requests.get('https://lovenote-production.up.railway.app/api/users').json()

print(f"本地用户: {len(local)}")
print(f"Railway用户: {len(remote)}")

local_names = {u['username'] for u in local}
remote_names = {u['username'] for u in remote}

if local_names == remote_names:
    print("✅ 用户完全同步")
else:
    print("⚠️  存在差异")
    print(f"仅本地: {local_names - remote_names}")
    print(f"仅Railway: {remote_names - local_names}")
EOF
```

---

## ⚙️ 配置定时双向同步

### 使用crontab

```bash
# 编辑crontab
crontab -e

# 添加双向同步（每2小时）
0 */2 * * * /path/to/scripts/bidirectional-sync.sh
```

### 或使用更频繁的同步

```bash
# 每30分钟同步
*/30 * * * * /path/to/scripts/bidirectional-sync.sh
```

---

## 🎯 最佳实践

### 推荐配置

1. **本地环境**
   - 主要开发和使用环境
   - 所有数据创建在这里
   - 定期自动备份

2. **Railway环境**
   - 自动部署
   - 接收本地同步
   - 作为分享平台

3. **同步策略**
   - 本地→Railway: 每小时（已配置）
   - Railway→本地: 按需手动
   - 数据主要以本地为准

### 避免冲突

**规则：**
- ✅ 在本地创建用户和消息
- ✅ Railway主要用于访问和分享
- ✅ 避免在两边同时修改相同数据

---

## 🆘 故障排除

### 同步失败

**检查：**
```bash
# 1. Railway是否在线
curl https://lovenote-production.up.railway.app/

# 2. 网络连接
ping railway.app

# 3. 查看日志
tail logs/bidirectional-sync.log
```

### 数据不一致

**解决：**
```bash
# 1. 手动运行双向同步
./scripts/bidirectional-sync.sh

# 2. 查看差异
# 运行上面的对比脚本

# 3. 必要时手动调整
# 编辑 data/users.json
```

---

## 📈 未来改进

### 可能的增强

1. **实时同步**
   - 使用WebSocket
   - 双向推送
   - 即时更新

2. **冲突解决**
   - 时间戳比较
   - 自动合并
   - 冲突提示

3. **完整API**
   - 获取所有消息
   - 导出/导入API
   - 批量操作

---

## ✅ 总结

### 当前状态

```
✅ 本地→Railway同步: 完全自动化
⚠️  Railway→本地同步: 受API限制
✅ 推荐：以本地为主
```

### 使用建议

```
1. 主要在本地使用
2. Railway自动同步（每小时）
3. 需要时手动双向同步
4. 定期检查数据一致性
```

---

*最后更新: 2025-11-22*  
*版本: v1.2*  
*状态: 单向自动化，双向手动*
