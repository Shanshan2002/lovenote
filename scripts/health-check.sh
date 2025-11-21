#!/bin/bash
# 健康检查和主动修复脚本

echo "🏥 LOVENOTE 健康检查"
echo "════════════════════════════════════════"

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

ISSUES=0

# 1. 检查数据文件
echo ""
echo "1️⃣  检查数据文件..."
if [ -f "data/users.json" ] && [ -f "data/notes.json" ]; then
    USER_COUNT=$(cat data/users.json | python3 -c "import json,sys; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
    NOTE_COUNT=$(cat data/notes.json | python3 -c "import json,sys; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
    echo "   ✅ 数据文件正常"
    echo "   📊 用户: $USER_COUNT, 消息: $NOTE_COUNT"
else
    echo "   ❌ 数据文件缺失"
    ISSUES=$((ISSUES+1))
fi

# 2. 检查本地服务器
echo ""
echo "2️⃣  检查本地服务器..."
if lsof -ti:8080 > /dev/null 2>&1; then
    LOCAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
    if [ "$LOCAL_STATUS" = "200" ]; then
        echo "   ✅ 本地服务器运行正常"
    else
        echo "   ⚠️  本地服务器响应异常: $LOCAL_STATUS"
        ISSUES=$((ISSUES+1))
    fi
else
    echo "   ❌ 本地服务器未运行"
    echo "   🔧 正在启动..."
    npm start > /dev/null 2>&1 &
    sleep 3
    echo "   ✅ 服务器已启动"
fi

# 3. 检查Railway
echo ""
echo "3️⃣  检查Railway部署..."
RAILWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://lovenote-production.up.railway.app)
if [ "$RAILWAY_STATUS" = "200" ]; then
    echo "   ✅ Railway运行正常"
    
    # 检查Railway数据
    RAILWAY_USERS=$(curl -s https://lovenote-production.up.railway.app/api/users | python3 -c "import json,sys; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
    echo "   📊 Railway用户: $RAILWAY_USERS"
    
    # 对比数据
    if [ "$USER_COUNT" != "$RAILWAY_USERS" ]; then
        echo "   ⚠️  数据不同步！"
        echo "   🔧 正在同步..."
        ./scripts/auto-sync-railway.sh > /dev/null 2>&1
        echo "   ✅ 已同步"
    else
        echo "   ✅ 数据已同步"
    fi
else
    echo "   ❌ Railway无法访问: $RAILWAY_STATUS"
    ISSUES=$((ISSUES+1))
fi

# 4. 检查备份
echo ""
echo "4️⃣  检查备份系统..."
BACKUP_COUNT=$(ls -d data-backups/backup_* 2>/dev/null | wc -l)
if [ $BACKUP_COUNT -gt 0 ]; then
    LATEST_BACKUP=$(ls -td data-backups/backup_* 2>/dev/null | head -1 | xargs basename)
    echo "   ✅ 备份系统正常"
    echo "   📦 备份数: $BACKUP_COUNT"
    echo "   🕐 最新: $LATEST_BACKUP"
else
    echo "   ⚠️  没有备份"
    ISSUES=$((ISSUES+1))
fi

# 5. 检查定时任务
echo ""
echo "5️⃣  检查定时任务..."
if crontab -l 2>/dev/null | grep -q "auto-sync-railway"; then
    echo "   ✅ Railway同步任务已配置"
else
    echo "   ⚠️  Railway同步任务未配置"
    ISSUES=$((ISSUES+1))
fi

# 总结
echo ""
echo "════════════════════════════════════════"
if [ $ISSUES -eq 0 ]; then
    echo "✅ 所有检查通过！系统健康运行"
else
    echo "⚠️  发现 $ISSUES 个问题"
    echo "建议运行: ./scripts/auto-deploy.sh"
fi
echo "════════════════════════════════════════"
