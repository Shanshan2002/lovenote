#!/bin/bash
# 数据导入脚本（从导出的数据恢复）

echo "📥 数据导入工具"
echo ""

if [ -z "$1" ]; then
    echo "用法: ./import-data.sh <导出文件夹路径>"
    echo ""
    echo "示例: ./import-data.sh data-export-20251121_230000"
    exit 1
fi

IMPORT_DIR="$1"

if [ ! -d "$IMPORT_DIR" ]; then
    echo "❌ 错误: 文件夹不存在: $IMPORT_DIR"
    exit 1
fi

# 检查文件
if [ ! -f "$IMPORT_DIR/users.json" ] && [ ! -f "$IMPORT_DIR/notes.json" ]; then
    echo "❌ 错误: 没有找到数据文件"
    exit 1
fi

# 备份当前数据
echo "🔄 备份当前数据..."
./backup-data.sh

# 确认导入
echo ""
echo "将从以下位置导入数据:"
echo "📁 $IMPORT_DIR"
echo ""
ls -lh "$IMPORT_DIR"/*.json 2>/dev/null
echo ""
read -p "确认导入? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "已取消"
    exit 0
fi

# 创建data目录
mkdir -p data

# 执行导入
if [ -f "$IMPORT_DIR/users.json" ]; then
    cp "$IMPORT_DIR/users.json" data/
    echo "✅ users.json 已导入"
fi

if [ -f "$IMPORT_DIR/notes.json" ]; then
    cp "$IMPORT_DIR/notes.json" data/
    echo "✅ notes.json 已导入"
fi

echo ""
echo "✅ 数据导入完成！"
echo ""
echo "📊 导入的数据:"
echo "用户数: $(cat data/users.json 2>/dev/null | grep -o '"id"' | wc -l || echo 0)"
echo "消息数: $(cat data/notes.json 2>/dev/null | grep -o '"id"' | wc -l || echo 0)"
echo ""
echo "🔄 请重启服务器以使更改生效"
