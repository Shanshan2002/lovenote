const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const usersFilePath = path.join(__dirname, '../data/users.json');
const notesFilePath = path.join(__dirname, '../data/notes.json');

// 核心用户列表（包括管理员和普通用户）
const CORE_USERS = [
  { username: "Shanshan", password: "200269", isAdmin: true },
  { username: "Wang", password: "1234", isAdmin: false }
  // 在此添加更多核心用户...
];

async function initializeCoreUsers() {
  let users = [];
  let notes = [];
  
  try {
    users = JSON.parse(fs.readFileSync(usersFilePath));
  } catch (error) {
    users = [];
  }
  
  try {
    notes = JSON.parse(fs.readFileSync(notesFilePath));
  } catch (error) {
    notes = [];
  }

  let changes = false;
  
  // 确保所有核心用户存在
  for (const coreUser of CORE_USERS) {
    const userExists = users.some(u => u.username === coreUser.username);
    
    if (!userExists) {
      users.push({
        id: uuidv4(),
        ...coreUser,
        createdAt: new Date().toISOString()
      });
      changes = true;
      console.log(`✅ 自动创建用户: ${coreUser.username}`);
    }
  }
  
  // 保存更新
  if (changes) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
    console.log('💾 用户数据已更新');
  }
}

module.exports = initializeCoreUsers;
