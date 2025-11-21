const fs = require('fs');
const path = require('path');
const backupDir = path.join(__dirname, '../data-backups');

function getLatestBackup() {
  try {
    const backups = fs.readdirSync(backupDir)
      .filter(folder => folder.startsWith('backup_'))
      .sort()
      .reverse();
    
    return backups.length > 0 ? backups[0] : null;
  } catch (error) {
    return null;
  }
}

module.exports = { getLatestBackup };
