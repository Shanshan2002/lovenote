# 🌐 自定义域名配置指南

## 📍 当前访问地址

### 本地开发

**推荐使用：**
```
http://localhost:8080
```

**不推荐：**
```
http://127.0.0.1:63059  ❌ IDE预览代理，不稳定
```

---

## 🎯 Railway自定义域名

### 当前Railway域名

```
https://lovenote-production.up.railway.app
```

### 配置自定义域名

#### 步骤1：准备域名

购买域名（推荐平台）：
- [Namecheap](https://namecheap.com) - 便宜
- [GoDaddy](https://godaddy.com) - 知名
- [Cloudflare](https://cloudflare.com) - 免费DNS

示例域名：
- `lovenote.com`
- `love-note.app`
- `mylovenote.io`

#### 步骤2：在Railway添加域名

1. **登录Railway Dashboard**
   ```
   https://railway.app/dashboard
   ```

2. **进入项目**
   - 点击 `lovenote` 项目
   - 点击服务卡片

3. **添加域名**
   - Settings → **Networking**
   - Custom Domain → **Add Domain**
   - 输入你的域名（如：`lovenote.com`）

4. **获取DNS记录**
   Railway会提供：
   ```
   Type: CNAME
   Name: @
   Value: lovenote-production.up.railway.app
   ```

#### 步骤3：配置DNS

在你的域名提供商：

1. **登录域名管理后台**

2. **添加DNS记录**

   **方法A：使用CNAME（推荐）**
   ```
   Type: CNAME
   Name: www
   Value: lovenote-production.up.railway.app
   TTL: 300
   ```

   **方法B：使用A记录**
   ```
   Type: A
   Name: @
   Value: [Railway提供的IP]
   TTL: 300
   ```

3. **保存配置**

#### 步骤4：等待生效

- DNS传播时间：5分钟 - 48小时
- 通常：15-30分钟

#### 步骤5：启用HTTPS

Railway自动提供SSL证书（Let's Encrypt）：
- ✅ 自动配置
- ✅ 自动续期
- ✅ 完全免费

---

## 🆓 免费域名方案

### Freenom（免费域名）

1. **访问** https://freenom.com
2. **注册免费域名**
   - `.tk`
   - `.ml`
   - `.ga`
   - `.cf`
   - `.gq`
3. **配置DNS指向Railway**

### 缺点：
- ⚠️ 不太专业
- ⚠️ 可能被回收
- ⚠️ SEO不友好

---

## 🔧 本地域名（开发用）

### macOS配置

编辑hosts文件：

```bash
sudo nano /etc/hosts
```

添加：
```
127.0.0.1 lovenote.local
127.0.0.1 my-lovenote.local
```

保存后访问：
```
http://lovenote.local:8080
```

### Windows配置

编辑文件：
```
C:\Windows\System32\drivers\etc\hosts
```

添加相同内容。

---

## 🌟 推荐域名组合

### 方案A：个人项目（推荐）

```
域名: lovenote.app
费用: ~$15/年
访问: https://lovenote.app
```

### 方案B：预算有限

```
域名: lovenote.tk (免费)
费用: $0
访问: http://lovenote.tk
```

### 方案C：仅本地使用

```
配置: hosts文件
费用: $0
访问: http://lovenote.local:8080
```

---

## 📊 访问地址汇总

| 环境 | 地址 | 用途 |
|------|------|------|
| **本地开发** | `http://localhost:8080` | 开发测试 ✅ |
| **Railway默认** | `https://lovenote-production.up.railway.app` | 临时分享 ✅ |
| **自定义域名** | `https://lovenote.com` | 正式使用 ⭐ |
| **本地别名** | `http://lovenote.local:8080` | 个性化 |

---

## 🎯 配置后的效果

### 配置前 ❌
```
http://127.0.0.1:63059  (IDE预览)
https://lovenote-production.up.railway.app  (太长)
```

### 配置后 ✅
```
http://localhost:8080  (本地)
https://lovenote.com  (生产环境)
```

---

## 🚀 快速设置指南

### 立即使用（无需配置）

1. **关闭当前页面**
2. **打开新浏览器标签**
3. **访问：**
   ```
   http://localhost:8080
   ```
4. **完成！**

### 配置自定义域名（可选）

1. **购买域名**（~$10-15/年）
2. **Railway添加域名**（2分钟）
3. **配置DNS**（5分钟）
4. **等待生效**（15-30分钟）
5. **享受专业域名！** 🎉

---

## 💡 建议

### 个人使用
```
✅ 使用 localhost:8080
✅ 本地开发够用
✅ 完全免费
```

### 分享给他人
```
✅ 使用 Railway默认域名
✅ 或配置自定义域名
✅ HTTPS安全
```

---

*最后更新: 2025-11-22*
*当前最佳访问: http://localhost:8080*
