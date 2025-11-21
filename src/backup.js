// 自动备份模块
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../data-backups');
const DATA_DIR = path.join(__dirname, '../data');

// 确保备份目录存在
function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
}

// 创建带时间戳的备份
function createBackup(reason = 'auto') {
    ensureBackupDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupPath = path.join(BACKUP_DIR, `backup_${timestamp}_${reason}`);
    
    try {
        // 创建备份目录
        fs.mkdirSync(backupPath, { recursive: true });
        
        // 复制数据文件
        const filesToBackup = ['users.json', 'notes.json'];
        let backedUp = 0;
        
        filesToBackup.forEach(file => {
            const sourcePath = path.join(DATA_DIR, file);
            const destPath = path.join(backupPath, file);
            
            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
                backedUp++;
            }
        });
        
        console.log(`✅ 备份成功: ${path.basename(backupPath)} (${backedUp} 个文件)`);
        return true;
    } catch (error) {
        console.error('❌ 备份失败:', error);
        return false;
    }
}

// 清理旧备份（保留最近N个）
function cleanOldBackups(keepCount = 10) {
    ensureBackupDir();
    
    try {
        const backups = fs.readdirSync(BACKUP_DIR)
            .filter(name => name.startsWith('backup_'))
            .map(name => ({
                name,
                path: path.join(BACKUP_DIR, name),
                time: fs.statSync(path.join(BACKUP_DIR, name)).mtime
            }))
            .sort((a, b) => b.time - a.time);
        
        // 删除超出保留数量的备份
        if (backups.length > keepCount) {
            const toDelete = backups.slice(keepCount);
            toDelete.forEach(backup => {
                fs.rmSync(backup.path, { recursive: true, force: true });
                console.log(`🗑️  删除旧备份: ${backup.name}`);
            });
        }
    } catch (error) {
        console.error('清理备份失败:', error);
    }
}

module.exports = {
    createBackup,
    cleanOldBackups,
    ensureBackupDir
};
