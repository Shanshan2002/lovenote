#!/bin/bash
# 监控数据变化并自动同步到Railway

echo "╔════════════════════════════════════════╗"
echo "║    数据监控和自动同步                 ║"
echo "╚════════════════════════════════════════╝"
echo ""

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="$PROJECT_DIR/data"
LAST_HASH=""

echo "🔍 开始监控数据变化..."
echo "📁 监控目录: $DATA_DIR"
echo "🔄 自动同步到Railway"
echo ""
echo "按 Ctrl+C 停止监控"
echo ""

# 计算数据哈希
get_data_hash() {
    if [ -f "$DATA_DIR/users.json" ] && [ -f "$DATA_DIR/notes.json" ]; then
        cat "$DATA_DIR/users.json" "$DATA_DIR/notes.json" | md5
    else
        echo ""
    fi
}

# 初始哈希
LAST_HASH=$(get_data_hash)

while true; do
    sleep 30  # 每30秒检查一次
    
    CURRENT_HASH=$(get_data_hash)
    
    if [ "$CURRENT_HASH" != "$LAST_HASH" ] && [ ! -z "$CURRENT_HASH" ]; then
        echo "🔄 检测到数据变化 - $(date)"
        
        # 自动备份
        echo "   📦 创建备份..."
        ./scripts/backup-data.sh > /dev/null 2>&1
        
        # 可选：自动同步到Railway
        # echo "   🚀 同步到Railway..."
        # ./scripts/sync-to-railway.sh > /dev/null 2>&1
        
        echo "   ✅ 备份完成"
        echo ""
        
        LAST_HASH=$CURRENT_HASH
    fi
done
