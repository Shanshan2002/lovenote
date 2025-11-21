#!/bin/bash
# 自动同步到Railway - 定时任务脚本

echo "🔄 Railway自动同步任务 - $(date)"

# 进入项目目录
cd "$(dirname "$0")/.."

RAILWAY_URL="https://lovenote-production.up.railway.app"
LOG_FILE="logs/railway-sync.log"

# 确保日志目录存在
mkdir -p logs

# 记录开始
echo "======================================" >> "$LOG_FILE"
echo "开始同步 - $(date)" >> "$LOG_FILE"

# 检查Railway是否在线
echo "🔍 检查Railway状态..."
RAILWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $RAILWAY_URL)

if [ "$RAILWAY_STATUS" != "200" ]; then
    echo "❌ Railway不可访问 (状态: $RAILWAY_STATUS)"
    echo "错误: Railway不可访问 - $(date)" >> "$LOG_FILE"
    exit 1
fi

echo "✅ Railway在线" | tee -a "$LOG_FILE"

# 读取本地用户
echo "📊 读取本地数据..."
if [ ! -f "data/users.json" ]; then
    echo "❌ 本地数据文件不存在"
    echo "错误: 数据文件不存在 - $(date)" >> "$LOG_FILE"
    exit 1
fi

# 同步用户
echo "👥 同步用户到Railway..." | tee -a "$LOG_FILE"

python3 << 'EOF'
import json
import sys
import requests

try:
    with open('data/users.json', 'r') as f:
        users = json.load(f)
    railway_url = "https://lovenote-production.up.railway.app/api"
    
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for user in users:
        try:
            response = requests.post(f"{railway_url}/users/register", 
                json={
                    "username": user["username"],
                    "password": user["password"]
                }, 
                timeout=10,
                headers={"Content-Type": "application/json"}
            )
            
            # 调试：打印响应
            # print(f"Debug: {user['username']} - Status: {response.status_code}, Response: {response.text[:100]}")
            
            if response.status_code == 201:
                print(f"✅ {user['username']}")
                success_count += 1
            elif response.status_code == 400:
                try:
                    error_msg = response.json().get('error', response.text)
                    if "already exists" in error_msg or "already" in error_msg:
                        print(f"⏭️  {user['username']} (已存在)")
                        skip_count += 1
                    else:
                        print(f"⚠️  {user['username']} ({error_msg})")
                        error_count += 1
                except:
                    print(f"⚠️  {user['username']} ({response.text[:50]})")
                    error_count += 1
            else:
                print(f"⚠️  {user['username']} (HTTP {response.status_code})")
                error_count += 1
        except requests.exceptions.RequestException as e:
            print(f"❌ {user['username']} (网络错误: {str(e)[:30]})")
            error_count += 1
        except Exception as e:
            print(f"❌ {user['username']} (错误: {str(e)[:30]})")
            error_count += 1
    
    print(f"\n同步结果: 成功 {success_count}, 跳过 {skip_count}, 错误 {error_count}")
    
    # 返回状态
    sys.exit(0 if error_count == 0 else 1)
    
except json.JSONDecodeError as e:
    print(f"JSON解析失败: {e}")
    sys.exit(1)
except Exception as e:
    print(f"同步失败: {e}")
    sys.exit(1)
EOF

SYNC_RESULT=$?

# 记录结果
if [ $SYNC_RESULT -eq 0 ]; then
    echo "✅ 同步完成 - $(date)" >> "$LOG_FILE"
else
    echo "⚠️  同步完成但有错误 - $(date)" >> "$LOG_FILE"
fi

# 统计信息
USER_COUNT=$(cat data/users.json 2>/dev/null | grep -o '"id"' | wc -l)
echo "本地用户数: $USER_COUNT" >> "$LOG_FILE"

echo "======================================" >> "$LOG_FILE"
echo ""
