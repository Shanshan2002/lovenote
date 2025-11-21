#!/bin/bash
# 完全自动化部署和更新脚本

echo "╔════════════════════════════════════════╗"
echo "║    自动部署和更新系统                 ║"
echo "╚════════════════════════════════════════╝"
echo ""

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

LOG_FILE="logs/auto-deploy.log"
mkdir -p logs

# 记录开始
echo "======================================" >> "$LOG_FILE"
echo "自动部署开始 - $(date)" >> "$LOG_FILE"

# 1. 自动备份数据
echo "📦 步骤1: 备份数据..."
./scripts/backup-data.sh >> "$LOG_FILE" 2>&1
echo "   ✅ 数据已备份"

# 2. 检查是否有代码变更
echo ""
echo "🔍 步骤2: 检查代码变更..."
git fetch origin main >> "$LOG_FILE" 2>&1

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "   📥 检测到远程更新，拉取最新代码..."
    git pull origin main >> "$LOG_FILE" 2>&1
    echo "   ✅ 代码已更新"
    
    # 重新安装依赖（如果package.json有变化）
    if git diff HEAD@{1} HEAD --name-only | grep -q "package.json"; then
        echo "   📦 更新依赖..."
        npm install >> "$LOG_FILE" 2>&1
        echo "   ✅ 依赖已更新"
    fi
else
    echo "   ✅ 代码已是最新"
fi

# 3. 同步数据到Railway
echo ""
echo "🚀 步骤3: 同步到Railway..."
./scripts/auto-sync-railway.sh >> "$LOG_FILE" 2>&1
SYNC_RESULT=$?

if [ $SYNC_RESULT -eq 0 ]; then
    echo "   ✅ Railway同步成功"
else
    echo "   ⚠️  Railway同步有问题，请检查日志"
fi

# 4. 验证Railway状态
echo ""
echo "✅ 步骤4: 验证Railway..."
RAILWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://lovenote-production.up.railway.app)

if [ "$RAILWAY_STATUS" = "200" ]; then
    echo "   ✅ Railway运行正常"
else
    echo "   ⚠️  Railway状态异常: $RAILWAY_STATUS"
fi

# 5. 检查本地服务器
echo ""
echo "🔍 步骤5: 检查本地服务..."
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "   ✅ 本地服务运行中"
else
    echo "   ⚠️  本地服务未运行"
fi

# 记录完成
echo ""
echo "✅ 自动部署完成 - $(date)" >> "$LOG_FILE"
echo "======================================" >> "$LOG_FILE"

echo ""
echo "╔════════════════════════════════════════╗"
echo "║         自动部署完成！                 ║"
echo "╚════════════════════════════════════════╝"
