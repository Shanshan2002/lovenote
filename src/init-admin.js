// 服务器启动时自动创建管理员账户
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const DATA_DIR = path.join(__dirname, '../data');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        console.log('✅ 数据目录已创建');
    }
}

function readUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('读取用户文件失败:', error);
    }
    return [];
}

function writeUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('写入用户文件失败:', error);
        return false;
    }
}

function initializeAdmin() {
    console.log('🔍 检查管理员账户...');
    
    ensureDataDir();
    
    const users = readUsers();
    
    // 检查是否已有Shanshan账户
    const existingShanshan = users.find(u => u.username === 'Shanshan');
    
    if (existingShanshan) {
        console.log('✅ Shanshan账户已存在');
        
        // 确保是管理员
        if (!existingShanshan.isAdmin) {
            existingShanshan.isAdmin = true;
            writeUsers(users);
            console.log('✅ Shanshan已设置为管理员');
        }
        
        return;
    }
    
    // 创建Shanshan管理员账户
    const adminUser = {
        id: uuidv4(),
        username: 'Shanshan',
        password: process.env.ADMIN_PASSWORD || '200269',
        isAdmin: true,
        createdAt: new Date().toISOString()
    };
    
    users.push(adminUser);
    
    if (writeUsers(users)) {
        console.log('✅ Shanshan管理员账户已创建');
        console.log(`   用户名: ${adminUser.username}`);
        console.log(`   密码: ${adminUser.password}`);
        console.log('');
    } else {
        console.error('❌ 创建管理员账户失败');
    }
}

module.exports = { initializeAdmin };
