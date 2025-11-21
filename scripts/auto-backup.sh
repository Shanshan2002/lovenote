#!/bin/bash
# 自动备份脚本 - 定时运行

echo "🔄 自动备份任务开始 - $(date)"

# 进入项目目录
cd "$(dirname "$0")/.."

# 执行备份
./scripts/backup-data.sh

# 清理旧备份（保留最近15个）
BACKUP_COUNT=$(ls -d data-backups/backup_* 2>/dev/null | wc -l)
if [ $BACKUP_COUNT -gt 15 ]; then
    echo "🗑️  清理旧备份..."
    ls -t data-backups/backup_* | tail -n +16 | xargs rm -rf
    echo "✅ 已清理，保留最近15个备份"
fi

# 记录日志
echo "✅ 自动备份完成 - $(date)" >> logs/auto-backup.log

# 统计信息
USER_COUNT=$(cat data/users.json 2>/dev/null | grep -o '"id"' | wc -l)
NOTE_COUNT=$(cat data/notes.json 2>/dev/null | grep -o '"id"' | wc -l)

echo "📊 备份数据: 用户 $USER_COUNT, 消息 $NOTE_COUNT" >> logs/auto-backup.log
echo ""
