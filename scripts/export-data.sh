#!/bin/bash
# 数据导出脚本（用于迁移到新环境）

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
EXPORT_DIR="data-export-${TIMESTAMP}"

echo "📤 数据导出工具"
echo ""

# 创建导出目录
mkdir -p "$EXPORT_DIR"

# 复制数据
if [ -f "data/users.json" ]; then
    cp data/users.json "$EXPORT_DIR/"
    echo "✅ users.json 已导出"
else
    echo "⚠️  users.json 不存在"
fi

if [ -f "data/notes.json" ]; then
    cp data/notes.json "$EXPORT_DIR/"
    echo "✅ notes.json 已导出"
else
    echo "⚠️  notes.json 不存在"
fi

# 创建README
cat > "$EXPORT_DIR/README.txt" << EOF
LOVENOTE 数据导出
=================

导出时间: $(date)
导出内容:
- users.json: 用户数据
- notes.json: 消息数据

导入方法:
1. 将此文件夹内的 .json 文件复制到项目的 data/ 目录
2. 重启服务器

注意:
- 导入前请备份现有数据
- 确保 data/ 目录存在
EOF

echo ""
echo "✅ 数据已导出到: $EXPORT_DIR"
echo ""
echo "📊 导出统计:"
echo "用户数: $(cat data/users.json 2>/dev/null | grep -o '"id"' | wc -l || echo 0)"
echo "消息数: $(cat data/notes.json 2>/dev/null | grep -o '"id"' | wc -l || echo 0)"
echo ""
echo "💡 提示: 您可以将此文件夹压缩并保存到安全位置"
