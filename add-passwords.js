// 为现有用户添加默认密码的脚本
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'data/users.json');

// 读取用户
const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

// 为每个用户添加密码和管理员状态
const updatedUsers = users.map((user, index) => {
    return {
        ...user,
        password: user.password || '1234', // 默认密码
        isAdmin: index === 0 ? true : (user.isAdmin || false) // 第一个用户是管理员
    };
});

// 保存
fs.writeFileSync(USERS_FILE, JSON.stringify(updatedUsers, null, 2));

console.log('✅ 用户已更新:');
updatedUsers.forEach(u => {
    console.log(`   - ${u.username}: password=${u.password}, isAdmin=${u.isAdmin}`);
});
