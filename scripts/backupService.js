// scripts/backupService.js
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../backups');
const BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
  
  // This assumes your app is saving data to a file
  // You'll need to adjust this path to where your data is stored
  const sourceFile = path.join(__dirname, '../data/transactions.json');
  
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, backupFile);
    console.log(`Backup created: ${backupFile}`);
  }
}

// Create initial backup
createBackup();

// Schedule regular backups
setInterval(createBackup, BACKUP_INTERVAL);