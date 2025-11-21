#!/bin/bash
# 数据备份脚本

BACKUP_DIR="data-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

# 创建备份目录
mkdir -p "$BACKUP_PATH"

# 复制数据文件
cp data/users.json "$BACKUP_PATH/" 2>/dev/null || echo "No users.json"
cp data/notes.json "$BACKUP_PATH/" 2>/dev/null || echo "No notes.json"

echo "✅ 备份完成: $BACKUP_PATH"
echo ""
echo "包含的文件:"
ls -lh "$BACKUP_PATH/"
