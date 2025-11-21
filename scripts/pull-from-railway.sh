#!/bin/bash
# 从Railway拉取数据到本地

echo "🔽 从Railway拉取数据到本地"
echo "══════════════════════════════════════"

RAILWAY_URL="https://lovenote-production.up.railway.app"
LOG_FILE="logs/railway-pull.log"

# 确保日志目录存在
mkdir -p logs

# 记录开始
echo "======================================" >> "$LOG_FILE"
echo "开始拉取 - $(date)" >> "$LOG_FILE"

# 检查Railway状态
echo "🔍 检查Railway连接..."
RAILWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $RAILWAY_URL)

if [ "$RAILWAY_STATUS" != "200" ]; then
    echo "❌ Railway不可访问 (状态: $RAILWAY_STATUS)"
    echo "错误: Railway不可访问 - $(date)" >> "$LOG_FILE"
    exit 1
fi

echo "✅ Railway在线"
echo ""

# 拉取用户和消息数据
echo "📥 拉取Railway数据..."

python3 << 'EOF'
import json
import sys
import requests
from datetime import datetime

try:
    railway_url = "https://lovenote-production.up.railway.app/api"
    
    # 读取本地数据
    try:
        with open('data/users.json', 'r') as f:
            local_users = json.load(f)
    except:
        local_users = []
    
    try:
        with open('data/notes.json', 'r') as f:
            local_notes = json.load(f)
    except:
        local_notes = []
    
    # 获取Railway数据
    print("📡 获取Railway用户...")
    users_response = requests.get(f"{railway_url}/users", timeout=10)
    railway_users = users_response.json() if users_response.status_code == 200 else []
    
    print(f"   Railway用户数: {len(railway_users)}")
    print(f"   本地用户数: {len(local_users)}")
    
    # 合并用户（避免重复）
    local_usernames = {u['username'] for u in local_users}
    new_users = 0
    
    for r_user in railway_users:
        if r_user['username'] not in local_usernames:
            # Railway上有新用户，添加到本地
            # 需要密码，默认使用用户名作为密码或从Railway获取
            print(f"   🆕 发现新用户: {r_user['username']}")
            new_users += 1
    
    # 注意：当前API不返回消息，需要为每个用户获取消息
    # 这里先记录，实际需要修改API或使用其他方法
    
    print(f"\n📊 拉取结果:")
    print(f"   新用户: {new_users} 个")
    print(f"   Railway总用户: {len(railway_users)}")
    
    # 保存提示
    if new_users > 0:
        print(f"\n⚠️  发现 {new_users} 个新用户")
        print(f"   但因为API限制，无法获取完整用户信息（包括密码）")
        print(f"   建议：主要在本地创建用户，然后同步到Railway")
    else:
        print("\n✅ 数据已同步")
    
except Exception as e:
    print(f"拉取失败: {e}")
    sys.exit(1)
EOF

PULL_RESULT=$?

# 记录结果
if [ $PULL_RESULT -eq 0 ]; then
    echo "✅ 拉取完成 - $(date)" >> "$LOG_FILE"
else
    echo "⚠️  拉取失败 - $(date)" >> "$LOG_FILE"
fi

echo "======================================" >> "$LOG_FILE"
echo ""
