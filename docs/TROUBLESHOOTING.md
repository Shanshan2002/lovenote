# 🔧 故障排除指南

## 常见问题

### 1. 看不到管理员按钮

**问题：** Shanshan 登录后看不到 ADMIN 按钮

**原因：** 浏览器缓存了旧的用户信息（没有 isAdmin 字段）

**解决方法：**

#### 方法 1：使用清除缓存工具（推荐）
1. 访问 http://localhost:8080/clear-cache.html
2. 点击"清除缓存"
3. 点击"返回登录"
4. 重新登录

#### 方法 2：手动清除浏览器缓存
1. 打开浏览器开发者工具（F12 或 Cmd+Option+I）
2. 转到 Application 或 Storage 标签
3. 找到 Local Storage
4. 删除 `currentUser` 键
5. 刷新页面重新登录

#### 方法 3：退出重新登录
1. 点击 LOGOUT 按钮
2. 重新登录（用户名: Shanshan, 密码: 200269）
3. 现在应该能看到 ADMIN 按钮了

#### 方法 4：使用无痕模式
1. 打开浏览器的无痕/隐私模式
2. 访问 http://localhost:8080
3. 登录（用户名: Shanshan, 密码: 200269）

---

### 2. 数据丢失

**问题：** 用户或消息数据丢失

**解决方法：**

#### 从备份恢复
```bash
# 查看可用备份
ls -lt data-backups/

# 恢复最新备份
./scripts/restore-data.sh

# 选择 1（恢复最新备份）
```

#### 从导出文件恢复
```bash
# 导入之前导出的数据
./scripts/import-data.sh data-export-TIMESTAMP/

# 重启服务器
npm start
```

---

### 3. 服务器无法启动

**问题：** `npm start` 报错或服务器启动失败

**解决方法：**

#### 检查端口占用
```bash
# 查看8080端口是否被占用
lsof -ti:8080

# 如果被占用，终止进程
lsof -ti:8080 | xargs kill -9
```

#### 重新安装依赖
```bash
# 删除 node_modules
rm -rf node_modules

# 重新安装
npm install

# 启动
npm start
```

#### 检查 Node.js 版本
```bash
# 查看版本
node -v

# 需要 Node.js >= 14
```

---

### 4. 消息发送失败

**问题：** 点击发送按钮后消息发送失败

**可能原因：**
1. 服务器未运行
2. 没有选择收件人
3. 消息内容为空
4. 网络连接问题

**解决方法：**
1. 确保服务器正在运行
2. 检查是否选择了收件人
3. 检查消息内容不为空
4. 查看浏览器控制台错误信息

---

### 5. 备份失败

**问题：** 运行备份脚本失败

**解决方法：**

#### 检查权限
```bash
# 添加执行权限
chmod +x scripts/*.sh

# 重新运行
./scripts/backup-data.sh
```

#### 检查目录
```bash
# 创建备份目录
mkdir -p data-backups

# 检查 data 目录
ls -la data/
```

---

### 6. 测试失败

**问题：** 运行测试套件有失败项

**解决方法：**

#### 运行测试并查看详情
```bash
./tests/test-suite.sh

# 查看具体失败原因
# 根据错误信息修复
```

#### 常见测试失败原因
1. 文件缺失 → 检查项目结构
2. JSON 格式错误 → 验证数据文件
3. 权限问题 → chmod +x scripts/*.sh
4. 依赖未安装 → npm install

---

### 7. 无法登录

**问题：** 输入用户名密码后无法登录

**可能原因：**
1. 密码错误
2. 用户不存在
3. 服务器未运行

**解决方法：**

#### 检查用户数据
```bash
# 查看用户列表
cat data/users.json

# 验证 Shanshan 账户
# 用户名: Shanshan
# 密码: 200269
```

#### 重置数据
```bash
# 如果数据损坏，从备份恢复
./scripts/restore-data.sh
```

---

### 8. Railway 部署问题

**问题：** 部署到 Railway 后数据丢失

**解决方法：**

#### 配置持久化卷
1. Railway 仪表板 → Settings → Volumes
2. 添加卷：
   - Name: data
   - Mount Path: /app/data
3. 添加备份卷：
   - Name: backups
   - Mount Path: /app/data-backups

#### 检查环境变量
```
PORT=8080 (Railway 自动设置)
```

---

### 9. 颜文字库无法打开

**问题：** 点击 EMOJI 按钮没有反应

**解决方法：**
1. 刷新页面（Cmd+R 或 Ctrl+R）
2. 清除浏览器缓存
3. 检查浏览器控制台错误
4. 确保 pager.js 加载完整

---

### 10. GitHub 更新后本地数据丢失

**问题：** git pull 后用户数据不见了

**解释：** 这是正常的！数据文件不在 Git 追踪中。

**解决方法：**

#### 使用之前的导出文件
```bash
./scripts/import-data.sh data-export-TIMESTAMP/
```

#### 或从备份恢复
```bash
./scripts/restore-data.sh
```

---

## 🆘 紧急联系

### 获取帮助
1. 查看文档：`docs/` 目录
2. 运行测试：`./tests/test-suite.sh`
3. 检查日志：浏览器控制台
4. 查看 GitHub Issues

### 有用的命令

```bash
# 检查系统状态
./tests/test-suite.sh

# 验证数据完整性
./tests/data-integrity-test.sh

# 查看备份
ls -lt data-backups/

# 检查服务器日志
# 在运行 npm start 的终端查看
```

---

## 📞 调试技巧

### 浏览器开发者工具
```
F12 或 Cmd+Option+I
- Console: 查看错误信息
- Network: 查看 API 请求
- Application: 查看 LocalStorage
```

### 服务器日志
```bash
# 启动服务器查看日志
npm start

# 查看详细输出
```

### 数据验证
```bash
# 验证 JSON 格式
python3 -m json.tool data/users.json
python3 -m json.tool data/notes.json
```

---

**最后更新: 2025-11-21**  
**版本: v1.2**
