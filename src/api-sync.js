// API同步模块 - 用于双向数据同步

const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const NOTES_FILE = path.join(__dirname, '../data/notes.json');

// 读取本地数据
function readLocalData() {
    try {
        const users = fs.existsSync(USERS_FILE) 
            ? JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
            : [];
        const notes = fs.existsSync(NOTES_FILE)
            ? JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'))
            : [];
        return { users, notes };
    } catch (error) {
        console.error('读取本地数据失败:', error);
        return { users: [], notes: [] };
    }
}

// 保存本地数据
function saveLocalData(users, notes) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
        return true;
    } catch (error) {
        console.error('保存本地数据失败:', error);
        return false;
    }
}

// 合并用户数据（避免重复）
function mergeUsers(localUsers, remoteUsers) {
    const userMap = new Map();
    
    // 先添加本地用户
    localUsers.forEach(user => {
        userMap.set(user.username, user);
    });
    
    // 合并远程用户（如果本地没有）
    remoteUsers.forEach(user => {
        if (!userMap.has(user.username)) {
            userMap.set(user.username, user);
        }
    });
    
    return Array.from(userMap.values());
}

// 合并消息数据（按时间戳，避免重复）
function mergeNotes(localNotes, remoteNotes) {
    const noteMap = new Map();
    
    // 使用消息ID作为唯一标识
    localNotes.forEach(note => {
        noteMap.set(note.id, note);
    });
    
    remoteNotes.forEach(note => {
        if (!noteMap.has(note.id)) {
            noteMap.set(note.id, note);
        }
    });
    
    // 按时间排序
    const merged = Array.from(noteMap.values());
    merged.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return merged;
}

module.exports = {
    readLocalData,
    saveLocalData,
    mergeUsers,
    mergeNotes
};
