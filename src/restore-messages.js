const fs = require('fs');
const path = require('path');
const { getLatestBackup } = require('./backup-utils');

const usersFilePath = path.join(__dirname, '../data/users.json');
const notesFilePath = path.join(__dirname, '../data/notes.json');
const backupDir = path.join(__dirname, '../data-backups');

async function restoreMessagesIfNeeded() {
  try {
    const currentNotes = JSON.parse(fs.readFileSync(notesFilePath));
    
    // 如果当前有消息，不需要恢复
    if (currentNotes.length > 0) return;
    
    console.log('🔍 检测到消息丢失，正在恢复...');
    
    // 获取最新备份
    const latestBackup = getLatestBackup();
    if (!latestBackup) {
      console.log('⚠️ 没有找到备份文件');
      return;
    }
    
    const backupNotesPath = path.join(backupDir, latestBackup, 'notes.json');
    const backupUsersPath = path.join(backupDir, latestBackup, 'users.json');
    
    // 恢复消息
    if (fs.existsSync(backupNotesPath)) {
      const backupNotes = JSON.parse(fs.readFileSync(backupNotesPath));
      fs.writeFileSync(notesFilePath, JSON.stringify(backupNotes, null, 2));
      console.log(`✅ 已从备份恢复 ${backupNotes.length} 条消息`);
    }
    
    // 恢复用户（确保最新）
    if (fs.existsSync(backupUsersPath)) {
      const backupUsers = JSON.parse(fs.readFileSync(backupUsersPath));
      fs.writeFileSync(usersFilePath, JSON.stringify(backupUsers, null, 2));
      console.log(`✅ 已从备份恢复 ${backupUsers.length} 位用户`);
    }
  } catch (error) {
    console.error('恢复失败:', error.message);
  }
}

module.exports = restoreMessagesIfNeeded;
