#!/bin/bash
# 数据同步到Railway

echo "╔════════════════════════════════════════╗"
echo "║    数据同步：本地 → Railway           ║"
echo "╚════════════════════════════════════════╝"
echo ""

RAILWAY_URL="https://lovenote-production.up.railway.app"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查Railway是否在线
echo "🔍 检查Railway状态..."
RAILWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $RAILWAY_URL)

if [ "$RAILWAY_STATUS" != "200" ]; then
    echo -e "${RED}❌ Railway不可访问 (状态: $RAILWAY_STATUS)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Railway在线${NC}"
echo ""

# 读取本地用户数据
echo "📊 读取本地数据..."
USERS=$(cat data/users.json)
NOTES=$(cat data/notes.json)

USER_COUNT=$(echo $USERS | python3 -c "import json,sys; print(len(json.load(sys.stdin)))")
NOTE_COUNT=$(echo $NOTES | python3 -c "import json,sys; print(len(json.load(sys.stdin)))")

echo "  本地用户数: $USER_COUNT"
echo "  本地消息数: $NOTE_COUNT"
echo ""

# 确认同步
echo -e "${YELLOW}⚠️  警告: 这将覆盖Railway上的所有数据！${NC}"
echo ""
read -p "确认同步到Railway? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "已取消"
    exit 0
fi

echo ""
echo "🚀 开始同步..."
echo ""

# 同步每个用户
echo "1️⃣  同步用户..."
echo $USERS | python3 << 'EOF'
import json
import sys
import requests

users = json.load(sys.stdin)
railway_url = "https://lovenote-production.up.railway.app/api"

success_count = 0
for user in users:
    try:
        # 尝试注册用户
        response = requests.post(f"{railway_url}/users/register", json={
            "username": user["username"],
            "password": user["password"]
        })
        
        if response.status_code == 201:
            print(f"   ✅ {user['username']}")
            success_count += 1
        elif response.status_code == 400 and "already exists" in response.text:
            print(f"   ⚠️  {user['username']} (已存在)")
        else:
            print(f"   ❌ {user['username']} ({response.status_code})")
    except Exception as e:
        print(f"   ❌ {user['username']} (错误: {e})")

print(f"\n   成功同步: {success_count}/{len(users)}")
EOF

echo ""

# 同步消息
echo "2️⃣  同步消息..."
echo "   (需要知道Railway用户ID，暂时跳过)"
echo "   建议：在Railway上重新发送消息"
echo ""

echo "╔════════════════════════════════════════╗"
echo "║         同步完成！                     ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📋 后续步骤："
echo "  1. 访问 Railway 网站"
echo "  2. 使用同步的账户登录"
echo "  3. 测试功能"
echo ""
echo "🌐 Railway URL: $RAILWAY_URL"
echo ""
