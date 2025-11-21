#!/bin/bash
# 在Railway上初始化Shanshan管理员账户

echo "╔════════════════════════════════════════╗"
echo "║   Railway 管理员初始化                ║"
echo "╚════════════════════════════════════════╝"
echo ""

RAILWAY_URL="https://lovenote-production.up.railway.app"
ADMIN_USERNAME="Shanshan"
ADMIN_PASSWORD="200269"

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🎯 目标: 在Railway创建Shanshan管理员账户"
echo "   用户名: $ADMIN_USERNAME"
echo "   密码: $ADMIN_PASSWORD"
echo ""

# 检查Railway状态
echo "🔍 检查Railway..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $RAILWAY_URL)

if [ "$STATUS" != "200" ]; then
    echo -e "${RED}❌ Railway不可访问${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Railway在线${NC}"
echo ""

# 尝试注册
echo "📝 注册管理员账户..."
RESPONSE=$(curl -s -X POST "$RAILWAY_URL/api/users/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}")

echo ""

# 检查响应
if echo "$RESPONSE" | grep -q "successfully"; then
    echo -e "${GREEN}✅ 账户创建成功！${NC}"
    echo ""
    echo "📊 账户信息:"
    echo "  用户名: $ADMIN_USERNAME"
    echo "  密码: $ADMIN_PASSWORD"
    echo "  角色: 管理员 (第一个用户)"
    echo ""
    echo "🌐 登录地址: $RAILWAY_URL"
elif echo "$RESPONSE" | grep -q "already"; then
    echo -e "${GREEN}✅ 账户已存在${NC}"
    echo ""
    echo "📊 登录信息:"
    echo "  用户名: $ADMIN_USERNAME"
    echo "  密码: $ADMIN_PASSWORD"
    echo ""
    echo "🌐 登录地址: $RAILWAY_URL"
else
    echo -e "${RED}❌ 创建失败${NC}"
    echo "响应: $RESPONSE"
    exit 1
fi

# 测试登录
echo ""
echo "🔐 验证登录..."
LOGIN_RESPONSE=$(curl -s -X POST "$RAILWAY_URL/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "successful\|isAdmin"; then
    echo -e "${GREEN}✅ 登录验证成功${NC}"
    
    # 检查是否是管理员
    if echo "$LOGIN_RESPONSE" | grep -q '"isAdmin":true'; then
        echo -e "${GREEN}✅ 管理员权限确认${NC}"
    fi
else
    echo -e "${RED}❌ 登录验证失败${NC}"
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║         初始化完成！                   ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "🚀 下一步:"
echo "  1. 访问: $RAILWAY_URL"
echo "  2. 登录: $ADMIN_USERNAME / $ADMIN_PASSWORD"
echo "  3. 开始使用！"
echo ""
