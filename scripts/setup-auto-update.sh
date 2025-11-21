#!/bin/bash
# 配置完全自动化的更新系统

echo "╔════════════════════════════════════════╗"
echo "║    配置自动更新系统                   ║"
echo "╚════════════════════════════════════════╝"
echo ""

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# 确保所有脚本可执行
chmod +x "$PROJECT_DIR"/scripts/*.sh

echo "⚙️  配置自动更新任务..."
echo ""
echo "将要配置的定时任务："
echo "─────────────────────────────────────────"
echo "1. 每小时同步到Railway"
echo "2. 每天自动备份"
echo "3. 每30分钟健康检查"
echo "4. 每6小时完整部署"
echo ""
read -p "确认配置所有自动化任务？(y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "已取消"
    exit 0
fi

# 创建临时crontab文件
TEMP_CRON=$(mktemp)

# 保留现有的crontab（如果有）
crontab -l 2>/dev/null | grep -v "auto-sync-railway\|auto-backup\|health-check\|auto-deploy" > "$TEMP_CRON" 2>/dev/null

# 添加新任务
cat >> "$TEMP_CRON" << EOF

# LOVENOTE 自动化任务
# 每小时同步到Railway
0 * * * * $PROJECT_DIR/scripts/auto-sync-railway.sh >> $PROJECT_DIR/logs/cron.log 2>&1

# 每天凌晨2点备份
0 2 * * * $PROJECT_DIR/scripts/auto-backup.sh >> $PROJECT_DIR/logs/cron.log 2>&1

# 每30分钟健康检查
*/30 * * * * $PROJECT_DIR/scripts/health-check.sh >> $PROJECT_DIR/logs/health.log 2>&1

# 每6小时完整部署
0 */6 * * * $PROJECT_DIR/scripts/auto-deploy.sh >> $PROJECT_DIR/logs/deploy.log 2>&1
EOF

# 安装新crontab
crontab "$TEMP_CRON"
rm "$TEMP_CRON"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 自动更新系统已配置！"
    echo ""
    echo "📋 配置详情："
    echo "─────────────────────────────────────────"
    echo "✅ Railway同步: 每小时执行"
    echo "✅ 数据备份:   每天凌晨2点"
    echo "✅ 健康检查:   每30分钟"
    echo "✅ 完整部署:   每6小时"
    echo ""
    echo "📝 日志位置："
    echo "   - logs/cron.log      (同步和备份)"
    echo "   - logs/health.log    (健康检查)"
    echo "   - logs/deploy.log    (部署日志)"
    echo ""
    echo "🔍 查看定时任务:"
    echo "   crontab -l"
    echo ""
    echo "📊 查看实时日志:"
    echo "   tail -f logs/health.log"
    echo ""
    echo "🎉 系统将自动保持更新，无需手动干预！"
else
    echo ""
    echo "❌ 配置失败"
    echo ""
    echo "💡 手动配置方法："
    echo "1. crontab -e"
    echo "2. 添加以下内容："
    echo ""
    cat "$TEMP_CRON" | grep "^[^#]"
    exit 1
fi
