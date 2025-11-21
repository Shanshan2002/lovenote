#!/bin/bash
# LOVENOTE 完整测试套件

echo "╔════════════════════════════════════════╗"
echo "║   LOVENOTE v1.2 测试套件              ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_case() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "[$TOTAL_TESTS] $1 ... "
}

pass() {
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo -e "${GREEN}✓ PASS${NC}"
}

fail() {
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo -e "${RED}✗ FAIL${NC}"
    echo "   原因: $1"
}

# ============ 测试开始 ============

echo "📋 第一部分：文件结构测试"
echo "─────────────────────────────────────────"

# 测试1: 检查必要目录
test_case "检查项目目录结构"
if [ -d "public" ] && [ -d "src" ] && [ -d "scripts" ] && [ -d "docs" ]; then
    pass
else
    fail "缺少必要目录"
fi

# 测试2: 检查数据目录
test_case "检查数据目录"
if [ -d "data" ]; then
    pass
else
    mkdir -p data
    pass "已创建"
fi

# 测试3: 检查数据文件
test_case "检查数据文件存在"
if [ -f "data/users.json" ] && [ -f "data/notes.json" ]; then
    pass
else
    fail "数据文件缺失"
fi

# 测试4: 检查备份目录
test_case "检查备份目录"
if [ -d "data-backups" ]; then
    pass
else
    mkdir -p data-backups
    pass "已创建"
fi

echo ""
echo "📋 第二部分：数据完整性测试"
echo "─────────────────────────────────────────"

# 测试5: JSON格式验证
test_case "验证 users.json 格式"
if python3 -c "import json; json.load(open('data/users.json'))" 2>/dev/null; then
    pass
else
    fail "JSON格式错误"
fi

test_case "验证 notes.json 格式"
if python3 -c "import json; json.load(open('data/notes.json'))" 2>/dev/null; then
    pass
else
    fail "JSON格式错误"
fi

# 测试6: 数据结构验证
test_case "验证用户数据结构"
USERS_VALID=$(python3 << 'EOF'
import json
try:
    users = json.load(open('data/users.json'))
    for user in users:
        assert 'id' in user
        assert 'username' in user
        assert 'password' in user
        assert 'isAdmin' in user
        assert 'createdAt' in user
    print("valid")
except:
    print("invalid")
EOF
)
if [ "$USERS_VALID" = "valid" ]; then
    pass
else
    fail "用户数据结构不完整"
fi

test_case "验证消息数据结构"
NOTES_VALID=$(python3 << 'EOF'
import json
try:
    notes = json.load(open('data/notes.json'))
    for note in notes:
        assert 'id' in note
        assert 'fromUserId' in note
        assert 'toUserId' in note
        assert 'content' in note
        assert 'createdAt' in note
    print("valid")
except:
    print("invalid")
EOF
)
if [ "$NOTES_VALID" = "valid" ]; then
    pass
else
    fail "消息数据结构不完整"
fi

echo ""
echo "📋 第三部分：备份系统测试"
echo "─────────────────────────────────────────"

# 测试7: 备份脚本存在
test_case "检查备份脚本"
if [ -f "scripts/backup-data.sh" ] && [ -x "scripts/backup-data.sh" ]; then
    pass
else
    fail "备份脚本不存在或无执行权限"
fi

# 测试8: 恢复脚本存在
test_case "检查恢复脚本"
if [ -f "scripts/restore-data.sh" ] && [ -x "scripts/restore-data.sh" ]; then
    pass
else
    fail "恢复脚本不存在或无执行权限"
fi

# 测试9: 导出脚本存在
test_case "检查导出脚本"
if [ -f "scripts/export-data.sh" ] && [ -x "scripts/export-data.sh" ]; then
    pass
else
    fail "导出脚本不存在或无执行权限"
fi

# 测试10: 导入脚本存在
test_case "检查导入脚本"
if [ -f "scripts/import-data.sh" ] && [ -x "scripts/import-data.sh" ]; then
    pass
else
    fail "导入脚本不存在或无执行权限"
fi

echo ""
echo "📋 第四部分：服务器测试"
echo "─────────────────────────────────────────"

# 测试11: 检查服务器文件
test_case "检查服务器主文件"
if [ -f "src/server.js" ]; then
    pass
else
    fail "server.js 不存在"
fi

# 测试12: 检查备份模块
test_case "检查备份模块"
if [ -f "src/backup.js" ]; then
    pass
else
    fail "backup.js 不存在"
fi

# 测试13: 检查依赖
test_case "检查 package.json"
if [ -f "package.json" ]; then
    pass
else
    fail "package.json 不存在"
fi

# 测试14: 检查 node_modules
test_case "检查依赖安装"
if [ -d "node_modules" ]; then
    pass
else
    fail "依赖未安装，请运行 npm install"
fi

echo ""
echo "📋 第五部分：前端资源测试"
echo "─────────────────────────────────────────"

# 测试15: HTML文件
test_case "检查 index.html"
if [ -f "public/index.html" ]; then
    pass
else
    fail "index.html 不存在"
fi

# 测试16: CSS文件
test_case "检查 pager.css"
if [ -f "public/css/pager.css" ]; then
    pass
else
    fail "pager.css 不存在"
fi

# 测试17: JavaScript文件
test_case "检查 pager.js"
if [ -f "public/js/pager.js" ]; then
    pass
else
    fail "pager.js 不存在"
fi

echo ""
echo "📋 第六部分：文档完整性测试"
echo "─────────────────────────────────────────"

# 测试18: README存在
test_case "检查 README.md"
if [ -f "README.md" ] || [ -f "docs/README.md" ]; then
    pass
else
    fail "README.md 不存在"
fi

# 测试19: CHANGELOG存在
test_case "检查 CHANGELOG.md"
if [ -f "CHANGELOG.md" ] || [ -f "docs/CHANGELOG.md" ]; then
    pass
else
    fail "CHANGELOG.md 不存在"
fi

# 测试20: 数据持久化文档
test_case "检查 DATA_PERSISTENCE.md"
if [ -f "docs/DATA_PERSISTENCE.md" ]; then
    pass
else
    fail "DATA_PERSISTENCE.md 不存在"
fi

echo ""
echo "📋 第七部分：Git 配置测试"
echo "─────────────────────────────────────────"

# 测试21: .gitignore 配置
test_case "检查 .gitignore"
if [ -f ".gitignore" ]; then
    if grep -q "data/" .gitignore && grep -q "data-backups/" .gitignore; then
        pass
    else
        fail "data 目录未在 .gitignore 中"
    fi
else
    fail ".gitignore 不存在"
fi

# 测试22: 检查数据是否被Git追踪
test_case "验证数据文件未被Git追踪"
if git ls-files | grep -q "data/users.json\|data/notes.json"; then
    fail "数据文件被Git追踪了！"
else
    pass
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║           测试结果总结                 ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ 所有测试通过！系统状态良好。${NC}"
    exit 0
else
    echo -e "${RED}✗ 有 $FAILED_TESTS 个测试失败，请检查。${NC}"
    exit 1
fi
