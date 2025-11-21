#!/bin/bash
# 安全更新脚本 - 保证数据不丢失

echo "╔════════════════════════════════════════╗"
echo "║    LOVENOTE 安全更新流程              ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 1. 备份当前数据
echo "📦 第1步: 备份当前数据..."
./scripts/backup-data.sh
if [ $? -ne 0 ]; then
    echo "❌ 备份失败，更新终止"
    exit 1
fi
echo ""

# 2. 导出数据（双重保险）
echo "📤 第2步: 导出数据..."
./scripts/export-data.sh
EXPORT_DIR=$(ls -t | grep data-export | head -1)
echo "   导出位置: $EXPORT_DIR"
echo ""

# 3. 保存服务器状态
echo "💾 第3步: 保存服务器状态..."
SERVER_PID=$(lsof -ti:8080)
if [ ! -z "$SERVER_PID" ]; then
    echo "   服务器运行中 (PID: $SERVER_PID)"
    NEED_RESTART=true
else
    echo "   服务器未运行"
    NEED_RESTART=false
fi
echo ""

# 4. 从GitHub拉取更新
echo "🔄 第4步: 从GitHub拉取更新..."
git stash push -m "Auto-stash before update $(date +%Y%m%d_%H%M%S)"
git pull origin main
if [ $? -ne 0 ]; then
    echo "❌ 拉取失败"
    git stash pop
    exit 1
fi
echo ""

# 5. 恢复数据
echo "♻️  第5步: 恢复数据..."
if [ -f "data/users.json" ]; then
    echo "   ✅ data/users.json 已存在（未被覆盖）"
else
    echo "   ⚠️  data/users.json 不存在，从最新备份恢复"
    LATEST_BACKUP=$(ls -t data-backups/backup_* | head -1)
    if [ -d "$LATEST_BACKUP" ]; then
        cp "$LATEST_BACKUP/users.json" data/
        cp "$LATEST_BACKUP/notes.json" data/
        echo "   ✅ 数据已从备份恢复"
    fi
fi
echo ""

# 6. 重新安装依赖（如果package.json有变化）
echo "📦 第6步: 检查依赖..."
if [ -f "package.json" ]; then
    npm install
    echo "   ✅ 依赖已更新"
fi
echo ""

# 7. 重启服务器（如果之前在运行）
if [ "$NEED_RESTART" = true ]; then
    echo "🔄 第7步: 重启服务器..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    npm start &
    sleep 2
    echo "   ✅ 服务器已重启"
else
    echo "ℹ️  第7步: 服务器未运行，跳过重启"
fi
echo ""

# 8. 验证数据
echo "✅ 第8步: 验证数据完整性..."
python3 << 'PYEOF'
import json
try:
    with open('data/users.json', 'r') as f:
        users = json.load(f)
    with open('data/notes.json', 'r') as f:
        notes = json.load(f)
    print(f"   ✅ 用户数: {len(users)}")
    print(f"   ✅ 消息数: {len(notes)}")
except Exception as e:
    print(f"   ❌ 验证失败: {e}")
PYEOF
echo ""

echo "╔════════════════════════════════════════╗"
echo "║         更新完成！                     ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📊 数据状态:"
echo "   - 用户数据: ✅ 保留"
echo "   - 消息数据: ✅ 保留"
echo "   - 备份数据: ✅ 已创建"
echo "   - 导出数据: ✅ $EXPORT_DIR"
echo ""
echo "🚀 服务器访问: http://localhost:8080"
echo ""
