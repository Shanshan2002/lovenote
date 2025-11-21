#!/bin/bash
# 配置自动备份定时任务

echo "╔════════════════════════════════════════╗"
echo "║    配置自动备份系统                   ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 获取项目绝对路径
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "📁 项目路径: $PROJECT_DIR"
echo ""

# 创建日志目录
mkdir -p "$PROJECT_DIR/logs"
echo "✅ 日志目录已创建"

# 备份脚本路径
BACKUP_SCRIPT="$PROJECT_DIR/scripts/auto-backup.sh"

# 确保脚本可执行
chmod +x "$BACKUP_SCRIPT"

echo ""
echo "⏰ 设置定时任务选项："
echo "─────────────────────────────────────────"
echo "1. 每小时备份一次（推荐开发）"
echo "2. 每天备份一次（推荐日常）"
echo "3. 每周备份一次（推荐稳定）"
echo "4. 自定义"
echo "5. 查看当前定时任务"
echo "6. 取消"
echo ""
read -p "请选择 (1-6): " choice

case $choice in
    1)
        # 每小时备份
        CRON_JOB="0 * * * * $BACKUP_SCRIPT"
        DESCRIPTION="每小时备份"
        ;;
    2)
        # 每天凌晨2点备份
        CRON_JOB="0 2 * * * $BACKUP_SCRIPT"
        DESCRIPTION="每天凌晨2点备份"
        ;;
    3)
        # 每周日凌晨3点备份
        CRON_JOB="0 3 * * 0 $BACKUP_SCRIPT"
        DESCRIPTION="每周日凌晨3点备份"
        ;;
    4)
        echo ""
        echo "Cron 格式: 分 时 日 月 周"
        echo "示例: 0 2 * * * 表示每天凌晨2点"
        read -p "请输入cron表达式: " custom_cron
        CRON_JOB="$custom_cron $BACKUP_SCRIPT"
        DESCRIPTION="自定义: $custom_cron"
        ;;
    5)
        echo ""
        echo "当前定时任务："
        echo "─────────────────────────────────────────"
        crontab -l | grep "auto-backup.sh" || echo "暂无自动备份任务"
        echo ""
        exit 0
        ;;
    6)
        echo "已取消"
        exit 0
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac

echo ""
echo "📋 将要添加的定时任务："
echo "   $DESCRIPTION"
echo "   $CRON_JOB"
echo ""
read -p "确认添加？(y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "已取消"
    exit 0
fi

# 添加到crontab
(crontab -l 2>/dev/null | grep -v "auto-backup.sh"; echo "$CRON_JOB") | crontab -

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 自动备份已配置！"
    echo ""
    echo "📊 配置详情："
    echo "   任务: $DESCRIPTION"
    echo "   脚本: $BACKUP_SCRIPT"
    echo "   日志: $PROJECT_DIR/logs/auto-backup.log"
    echo ""
    echo "🔍 查看定时任务："
    echo "   crontab -l"
    echo ""
    echo "📝 查看备份日志："
    echo "   tail -f $PROJECT_DIR/logs/auto-backup.log"
    echo ""
    echo "🗑️  删除定时任务："
    echo "   crontab -e  # 手动删除相关行"
else
    echo "❌ 配置失败"
    exit 1
fi
