#!/bin/bash
# 数据完整性测试

echo "╔════════════════════════════════════════╗"
echo "║      数据完整性测试                    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 创建测试报告
REPORT_FILE="test-report-$(date +%Y%m%d_%H%M%S).txt"

{
    echo "LOVENOTE 数据完整性测试报告"
    echo "测试时间: $(date)"
    echo "========================================"
    echo ""

    # 1. 统计数据
    echo "1. 数据统计"
    echo "----------------------------------------"
    USER_COUNT=$(cat data/users.json 2>/dev/null | grep -o '"id"' | wc -l)
    NOTE_COUNT=$(cat data/notes.json 2>/dev/null | grep -o '"id"' | wc -l)
    BACKUP_COUNT=$(ls -d data-backups/backup_* 2>/dev/null | wc -l)
    
    echo "用户数量: $USER_COUNT"
    echo "消息数量: $NOTE_COUNT"
    echo "备份数量: $BACKUP_COUNT"
    echo ""

    # 2. 验证JSON格式
    echo "2. JSON 格式验证"
    echo "----------------------------------------"
    if python3 -c "import json; json.load(open('data/users.json'))" 2>/dev/null; then
        echo "✓ users.json 格式正确"
    else
        echo "✗ users.json 格式错误"
    fi
    
    if python3 -c "import json; json.load(open('data/notes.json'))" 2>/dev/null; then
        echo "✓ notes.json 格式正确"
    else
        echo "✗ notes.json 格式错误"
    fi
    echo ""

    # 3. 检查数据字段完整性
    echo "3. 数据字段完整性"
    echo "----------------------------------------"
    python3 << 'EOF'
import json

# 检查用户数据
try:
    with open('data/users.json', 'r') as f:
        users = json.load(f)
    
    required_fields = ['id', 'username', 'password', 'isAdmin', 'createdAt']
    incomplete_users = []
    
    for i, user in enumerate(users):
        missing = [f for f in required_fields if f not in user]
        if missing:
            incomplete_users.append((i, user.get('username', 'Unknown'), missing))
    
    if incomplete_users:
        print("✗ 发现不完整的用户数据:")
        for idx, name, missing in incomplete_users:
            print(f"  用户 {idx} ({name}): 缺少字段 {missing}")
    else:
        print(f"✓ 所有 {len(users)} 个用户数据完整")
except Exception as e:
    print(f"✗ 用户数据检查失败: {e}")

# 检查消息数据
try:
    with open('data/notes.json', 'r') as f:
        notes = json.load(f)
    
    required_fields = ['id', 'fromUserId', 'toUserId', 'content', 'createdAt', 'read']
    incomplete_notes = []
    
    for i, note in enumerate(notes):
        missing = [f for f in required_fields if f not in note]
        if missing:
            incomplete_notes.append((i, missing))
    
    if incomplete_notes:
        print("✗ 发现不完整的消息数据:")
        for idx, missing in incomplete_notes:
            print(f"  消息 {idx}: 缺少字段 {missing}")
    else:
        print(f"✓ 所有 {len(notes)} 条消息数据完整")
except Exception as e:
    print(f"✗ 消息数据检查失败: {e}")
EOF
    echo ""

    # 4. 检查数据关联性
    echo "4. 数据关联性检查"
    echo "----------------------------------------"
    python3 << 'EOF'
import json

try:
    with open('data/users.json', 'r') as f:
        users = json.load(f)
    with open('data/notes.json', 'r') as f:
        notes = json.load(f)
    
    user_ids = set(u['id'] for u in users)
    orphaned_notes = []
    
    for note in notes:
        if note['fromUserId'] not in user_ids:
            orphaned_notes.append(('发送者', note['fromUsername'], note['fromUserId']))
        if note['toUserId'] not in user_ids:
            orphaned_notes.append(('接收者', note['toUsername'], note['toUserId']))
    
    if orphaned_notes:
        print("✗ 发现孤立消息（用户不存在）:")
        for role, name, uid in orphaned_notes:
            print(f"  {role}: {name} (ID: {uid[:8]}...)")
    else:
        print("✓ 所有消息的用户关联正确")
except Exception as e:
    print(f"✗ 关联性检查失败: {e}")
EOF
    echo ""

    # 5. 检查备份完整性
    echo "5. 备份完整性检查"
    echo "----------------------------------------"
    if [ -d "data-backups" ]; then
        BACKUP_DIRS=$(ls -d data-backups/backup_* 2>/dev/null | wc -l)
        echo "备份目录数量: $BACKUP_DIRS"
        
        if [ $BACKUP_DIRS -gt 0 ]; then
            LATEST_BACKUP=$(ls -t data-backups/backup_* | head -1)
            echo "最新备份: $(basename $LATEST_BACKUP)"
            
            if [ -f "$LATEST_BACKUP/users.json" ] && [ -f "$LATEST_BACKUP/notes.json" ]; then
                echo "✓ 最新备份包含完整数据文件"
            else
                echo "✗ 最新备份数据文件不完整"
            fi
        else
            echo "⚠ 没有备份，建议运行 ./scripts/backup-data.sh"
        fi
    else
        echo "✗ 备份目录不存在"
    fi
    echo ""

    # 6. 文件权限检查
    echo "6. 文件权限检查"
    echo "----------------------------------------"
    if [ -r "data/users.json" ] && [ -w "data/users.json" ]; then
        echo "✓ users.json 可读写"
    else
        echo "✗ users.json 权限问题"
    fi
    
    if [ -r "data/notes.json" ] && [ -w "data/notes.json" ]; then
        echo "✓ notes.json 可读写"
    else
        echo "✗ notes.json 权限问题"
    fi
    echo ""

    # 7. 总结
    echo "========================================"
    echo "测试完成时间: $(date)"
    echo "========================================"

} | tee "$REPORT_FILE"

echo ""
echo "✅ 测试报告已保存到: $REPORT_FILE"
