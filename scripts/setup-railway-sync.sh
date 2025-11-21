#!/bin/bash
# 配置Railway定时同步

echo "╔════════════════════════════════════════╗"
echo "║    配置Railway定时同步                ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 获取项目路径
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SYNC_SCRIPT="$PROJECT_DIR/scripts/auto-sync-railway.sh"

# 确保脚本可执行
chmod +x "$SYNC_SCRIPT"

# 创建日志目录
mkdir -p "$PROJECT_DIR/logs"

echo "📁 项目路径: $PROJECT_DIR"
echo ""

# 测试Railway连接
echo "🔍 测试Railway连接..."
RAILWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://lovenote-production.up.railway.app)

if [ "$RAILWAY_STATUS" = "200" ]; then
    echo "✅ Railway在线"
else
    echo "⚠️  Railway状态: $RAILWAY_STATUS"
    echo "   继续配置，但请确保Railway正常运行"
fi

echo ""
echo "⏰ Railway同步频率选项："
echo "─────────────────────────────────────────"
echo "1. 每小时同步一次"
echo "2. 每6小时同步一次（推荐）⭐"
echo "3. 每天同步一次"
echo "4. 每周同步一次"
echo "5. 自定义"
echo "6. 查看当前配置"
echo "7. 取消"
echo ""
read -p "请选择 (1-7): " choice

case $choice in
    1)
        CRON_JOB="0 * * * * $SYNC_SCRIPT"
        DESCRIPTION="每小时同步到Railway"
        ;;
    2)
        CRON_JOB="0 */6 * * * $SYNC_SCRIPT"
        DESCRIPTION="每6小时同步到Railway"
        ;;
    3)
        CRON_JOB="0 3 * * * $SYNC_SCRIPT"
        DESCRIPTION="每天凌晨3点同步到Railway"
        ;;
    4)
        CRON_JOB="0 4 * * 0 $SYNC_SCRIPT"
        DESCRIPTION="每周日凌晨4点同步到Railway"
        ;;
    5)
        echo ""
        echo "Cron 格式: 分 时 日 月 周"
        read -p "请输入cron表达式: " custom_cron
        CRON_JOB="$custom_cron $SYNC_SCRIPT"
        DESCRIPTION="自定义同步: $custom_cron"
        ;;
    6)
        echo ""
        echo "当前Railway同步任务："
        echo "─────────────────────────────────────────"
        crontab -l 2>/dev/null | grep "auto-sync-railway" || echo "暂无同步任务"
        echo ""
        exit 0
        ;;
    7)
        echo "已取消"
        exit 0
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac

echo ""
echo "📋 配置详情："
echo "   任务: $DESCRIPTION"
echo "   脚本: $SYNC_SCRIPT"
echo "   日志: $PROJECT_DIR/logs/railway-sync.log"
echo ""
read -p "确认配置？(y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "已取消"
    exit 0
fi

# 添加到crontab
(crontab -l 2>/dev/null | grep -v "auto-sync-railway"; echo "$CRON_JOB") | crontab -

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Railway同步已配置！"
    echo ""
    echo "📊 配置信息："
    echo "   频率: $DESCRIPTION"
    echo "   目标: https://lovenote-production.up.railway.app"
    echo "   日志: logs/railway-sync.log"
    echo ""
    echo "🔍 查看定时任务："
    echo "   crontab -l"
    echo ""
    echo "📝 查看同步日志："
    echo "   tail -f logs/railway-sync.log"
    echo ""
    echo "🧪 手动测试同步："
    echo "   ./scripts/auto-sync-railway.sh"
    echo ""
else
    echo "❌ 配置失败"
    echo ""
    echo "💡 手动配置方法："
    echo "   1. 运行: crontab -e"
    echo "   2. 添加: $CRON_JOB"
    echo "   3. 保存退出"
    exit 1
fi
