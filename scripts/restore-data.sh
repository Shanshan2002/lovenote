#!/bin/bash
# 数据恢复脚本

echo "🔄 数据恢复工具"
echo ""

# 检查是否有备份
if [ ! -d "data-backups" ] || [ -z "$(ls -A data-backups 2>/dev/null)" ]; then
    echo "❌ 没有找到备份文件"
    exit 1
fi

# 列出所有备份
echo "📦 可用的备份："
echo "----------------------------------------"
ls -lt data-backups/ | grep "^d" | awk '{print NR". "$9}' | head -10
echo ""

# 获取最新备份
LATEST_BACKUP=$(ls -t data-backups/ | head -1)

echo "🔍 最新备份: $LATEST_BACKUP"
echo ""
echo "请选择操作:"
echo "1. 恢复最新备份"
echo "2. 选择特定备份"
echo "3. 取消"
echo ""
read -p "请输入选项 (1-3): " choice

case $choice in
    1)
        BACKUP_DIR="data-backups/$LATEST_BACKUP"
        ;;
    2)
        read -p "请输入备份编号: " num
        BACKUP_DIR=$(ls -t data-backups/ | sed -n "${num}p")
        BACKUP_DIR="data-backups/$BACKUP_DIR"
        ;;
    3)
        echo "已取消"
        exit 0
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

# 确认恢复
echo ""
echo "⚠️  将恢复备份: $(basename $BACKUP_DIR)"
echo "⚠️  这将覆盖当前数据！"
read -p "确认恢复? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "已取消"
    exit 0
fi

# 执行恢复
mkdir -p data
cp "$BACKUP_DIR/users.json" data/ 2>/dev/null && echo "✅ users.json 已恢复"
cp "$BACKUP_DIR/notes.json" data/ 2>/dev/null && echo "✅ notes.json 已恢复"

echo ""
echo "✅ 数据恢复完成！"
echo ""
echo "📊 恢复的数据："
echo "用户数: $(cat data/users.json | grep -o '"id"' | wc -l)"
echo "消息数: $(cat data/notes.json | grep -o '"id"' | wc -l)"
