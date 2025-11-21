#!/bin/bash
# 隐私检查脚本

echo "🔍 检查数据隐私保护..."
echo ""

# 检查 .gitignore
echo "1. 检查 .gitignore 配置："
if grep -q "data/" .gitignore; then
    echo "   ✅ data/ 已在 .gitignore 中"
else
    echo "   ❌ data/ 未在 .gitignore 中"
fi

# 检查是否有数据文件被追踪
echo ""
echo "2. 检查是否有敏感文件被 Git 追踪："
TRACKED=$(git ls-files | grep -E "(data/|users\.json|notes\.json|\.env$)" || true)
if [ -z "$TRACKED" ]; then
    echo "   ✅ 没有敏感文件被追踪"
else
    echo "   ⚠️  发现被追踪的敏感文件："
    echo "$TRACKED"
fi

# 检查 data 目录
echo ""
echo "3. 检查 data 目录："
if [ -d "data" ]; then
    echo "   ✅ data/ 目录存在"
    echo "   文件数量: $(find data -type f | wc -l)"
else
    echo "   ℹ️  data/ 目录不存在"
fi

# 检查备份
echo ""
echo "4. 检查备份："
if [ -d "data-backups" ]; then
    BACKUP_COUNT=$(find data-backups -type d -name "backup_*" | wc -l)
    echo "   ✅ 备份目录存在"
    echo "   备份数量: $BACKUP_COUNT"
else
    echo "   ℹ️  暂无备份"
fi

# 检查远程仓库
echo ""
echo "5. GitHub 仓库信息："
git remote -v | head -2

echo ""
echo "⚠️  重要提示："
echo "   - 确保 GitHub 仓库设置为 Private（私有）"
echo "   - 不要在公开渠道分享仓库链接"
echo "   - 定期备份数据"
echo ""
