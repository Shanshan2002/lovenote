#!/bin/bash
# 完整部署流程：本地 → GitHub → Railway

echo "╔════════════════════════════════════════╗"
echo "║  LOVENOTE 完整部署流程                ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============ 步骤1：备份本地数据 ============
echo -e "${BLUE}📦 步骤1: 备份本地数据${NC}"
echo "─────────────────────────────────────────"
./scripts/backup-data.sh
if [ $? -ne 0 ]; then
    echo "❌ 备份失败，流程终止"
    exit 1
fi
echo ""

# ============ 步骤2：导出数据（双重保险）============
echo -e "${BLUE}📤 步骤2: 导出数据（迁移准备）${NC}"
echo "─────────────────────────────────────────"
./scripts/export-data.sh
EXPORT_DIR=$(ls -t | grep data-export | head -1)
echo -e "${GREEN}✅ 导出位置: $EXPORT_DIR${NC}"
echo ""

# ============ 步骤3：检查Git状态 ============
echo -e "${BLUE}🔍 步骤3: 检查Git状态${NC}"
echo "─────────────────────────────────────────"
git status --short
echo ""

# ============ 步骤4：提交到GitHub ============
echo -e "${BLUE}📤 步骤4: 推送到GitHub${NC}"
echo "─────────────────────────────────────────"

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "发现未提交的更改，准备提交..."
    
    read -p "请输入提交信息 (回车使用默认): " COMMIT_MSG
    
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Update: $(date +%Y-%m-%d_%H:%M:%S)"
    fi
    
    git add -A
    git commit -m "$COMMIT_MSG"
    
    if [ $? -ne 0 ]; then
        echo "❌ 提交失败"
        exit 1
    fi
fi

echo "推送到GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ 推送失败"
    exit 1
fi

echo -e "${GREEN}✅ 已推送到GitHub${NC}"
echo ""

# ============ 步骤5：触发Railway部署 ============
echo -e "${BLUE}🚀 步骤5: Railway自动部署${NC}"
echo "─────────────────────────────────────────"
echo "GitHub已更新，Railway将自动检测并部署..."
echo "预计部署时间: 1-3分钟"
echo ""

# ============ 步骤6：等待部署完成 ============
echo -e "${BLUE}⏳ 步骤6: 等待Railway部署${NC}"
echo "─────────────────────────────────────────"
echo "正在等待部署完成..."

for i in {1..30}; do
    echo -n "."
    sleep 2
    
    # 每10秒检查一次
    if [ $((i % 5)) -eq 0 ]; then
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://lovenote-production.up.railway.app/)
        if [ "$RESPONSE" = "200" ]; then
            echo ""
            echo -e "${GREEN}✅ Railway服务响应正常${NC}"
            break
        fi
    fi
done
echo ""

# ============ 步骤7：验证部署 ============
echo -e "${BLUE}✅ 步骤7: 验证部署${NC}"
echo "─────────────────────────────────────────"

# 检查Railway版本
VERSION=$(curl -s https://lovenote-production.up.railway.app/ | grep -o 'LOVENOTE v[0-9.]*' | head -1)
echo "Railway版本: $VERSION"

# 检查API
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://lovenote-production.up.railway.app/api/users)
if [ "$API_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ API正常工作${NC}"
else
    echo -e "${YELLOW}⚠️  API状态: $API_STATUS${NC}"
fi
echo ""

# ============ 步骤8：数据迁移说明 ============
echo -e "${BLUE}📋 步骤8: Railway数据配置${NC}"
echo "─────────────────────────────────────────"
echo ""
echo "重要提示："
echo "1. Railway使用独立的数据库"
echo "2. 本地数据不会自动同步到Railway"
echo "3. 需要在Railway上重新创建用户"
echo ""
echo "推荐操作："
echo "─────────────────────────────────────────"
echo "方法A：手动注册（最简单）"
echo "  1. 访问: https://lovenote-production.up.railway.app/"
echo "  2. 点击 REGISTER"
echo "  3. 注册第一个用户（自动成为管理员）"
echo ""
echo "方法B：配置持久化卷（数据永久保存）"
echo "  1. 进入Railway仪表板"
echo "  2. Settings → Volumes → Add Volume"
echo "  3. Name: data, Mount Path: /app/data"
echo "  4. Name: backups, Mount Path: /app/data-backups"
echo ""
echo "本地数据导出位置："
echo "  📁 $EXPORT_DIR"
echo ""

# ============ 完成 ============
echo "╔════════════════════════════════════════╗"
echo "║         部署流程完成！                 ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📊 部署总结:"
echo "─────────────────────────────────────────"
echo -e "${GREEN}✅ 本地数据已备份${NC}"
echo -e "${GREEN}✅ 数据已导出: $EXPORT_DIR${NC}"
echo -e "${GREEN}✅ 代码已推送到GitHub${NC}"
echo -e "${GREEN}✅ Railway已触发自动部署${NC}"
echo ""
echo "🌐 访问地址:"
echo "  本地: http://localhost:8080"
echo "  Railway: https://lovenote-production.up.railway.app/"
echo ""
echo "📚 后续步骤:"
echo "  1. 在Railway网站注册账户"
echo "  2. 配置Railway持久化卷（可选）"
echo "  3. 测试所有功能"
echo ""
