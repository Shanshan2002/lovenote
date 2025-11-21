#!/bin/bash
# 测试Railway同步

echo "╔════════════════════════════════════════╗"
echo "║    Railway同步测试                    ║"
echo "╚════════════════════════════════════════╝"
echo ""

RAILWAY_URL="https://lovenote-production.up.railway.app"

# 1. 检查Railway状态
echo "1️⃣  检查Railway状态..."
RAILWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $RAILWAY_URL)
echo "   状态码: $RAILWAY_STATUS"

if [ "$RAILWAY_STATUS" != "200" ]; then
    echo "   ❌ Railway不可访问"
    exit 1
fi
echo "   ✅ Railway在线"
echo ""

# 2. 检查本地数据
echo "2️⃣  检查本地数据..."
if [ -f "data/users.json" ]; then
    USER_COUNT=$(cat data/users.json | grep -o '"id"' | wc -l)
    echo "   本地用户数: $USER_COUNT"
    echo "   ✅ 数据文件存在"
else
    echo "   ❌ 数据文件不存在"
    exit 1
fi
echo ""

# 3. 检查Railway API
echo "3️⃣  测试Railway API..."
API_RESPONSE=$(curl -s "$RAILWAY_URL/api/users")
RAILWAY_USERS=$(echo $API_RESPONSE | grep -o '"id"' | wc -l)
echo "   Railway用户数: $RAILWAY_USERS"
echo "   ✅ API正常"
echo ""

# 4. 测试同步
echo "4️⃣  执行同步测试..."
echo "   (这将尝试同步所有用户到Railway)"
read -p "   确认测试？(y/n): " confirm

if [ "$confirm" = "y" ]; then
    echo ""
    ./scripts/auto-sync-railway.sh
else
    echo "   已跳过"
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║         测试完成！                     ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📊 环境对比："
echo "   本地用户: $USER_COUNT"
echo "   Railway用户: $RAILWAY_USERS"
echo ""

if [ "$confirm" = "y" ]; then
    echo "📝 查看同步日志："
    echo "   tail logs/railway-sync.log"
    echo ""
fi
