#!/usr/bin/env node

/**
 * AUTOMATIC BACKUP SYSTEM
 * Runs before any major changes to create snapshots
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BackupSystem {
  constructor() {
    this.backupDir = path.join(__dirname, 'backups');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createSnapshot(description = 'Manual backup') {
    const snapshotId = `${this.timestamp}_${description.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const snapshotPath = path.join(this.backupDir, snapshotId);
    
    console.log(`📸 Creating backup snapshot: ${snapshotId}`);
    
    try {
      // Create snapshot directory
      fs.mkdirSync(snapshotPath, { recursive: true });
      
      // Copy critical files
      const criticalFiles = [
        'dashboard/src/components/DesktopDashboard.jsx',
        'dashboard/src/components/MobileDashboard.jsx',
        'dashboard/src/App.jsx',
        'dashboard/src/App.css',
        'dashboard/COMPONENT_BACKUP.md',
        'UI_PROTECTION.md',
        'server.js',
        'editorBridge.js',
        'replit.md'
      ];

      for (const file of criticalFiles) {
        const sourcePath = path.join(__dirname, file);
        const targetPath = path.join(snapshotPath, file);
        
        if (fs.existsSync(sourcePath)) {
          const targetDir = path.dirname(targetPath);
          fs.mkdirSync(targetDir, { recursive: true });
          fs.copyFileSync(sourcePath, targetPath);
        }
      }

      // Copy entire dashboard/src directory
      this.copyDirectory(
        path.join(__dirname, 'dashboard/src'),
        path.join(snapshotPath, 'dashboard/src')
      );

      // Copy validators directory
      this.copyDirectory(
        path.join(__dirname, 'validators'),
        path.join(snapshotPath, 'validators')
      );

      // Create manifest
      const manifest = {
        id: snapshotId,
        timestamp: this.timestamp,
        description,
        files: criticalFiles.filter(f => fs.existsSync(path.join(__dirname, f))),
        created: new Date().toISOString()
      };

      fs.writeFileSync(
        path.join(snapshotPath, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      );

      console.log(`✅ Backup created: ${snapshotPath}`);
      return snapshotId;
    } catch (error) {
      console.error(`❌ Backup failed: ${error.message}`);
      throw error;
    }
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(src)) return;
    
    fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  async restoreSnapshot(snapshotId) {
    const snapshotPath = path.join(this.backupDir, snapshotId);
    
    if (!fs.existsSync(snapshotPath)) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    console.log(`🔄 Restoring snapshot: ${snapshotId}`);
    
    try {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(snapshotPath, 'manifest.json'), 'utf8')
      );

      // Restore files
      for (const file of manifest.files) {
        const sourcePath = path.join(snapshotPath, file);
        const targetPath = path.join(__dirname, file);
        
        if (fs.existsSync(sourcePath)) {
          const targetDir = path.dirname(targetPath);
          fs.mkdirSync(targetDir, { recursive: true });
          fs.copyFileSync(sourcePath, targetPath);
        }
      }

      // Restore dashboard/src directory
      this.copyDirectory(
        path.join(snapshotPath, 'dashboard/src'),
        path.join(__dirname, 'dashboard/src')
      );

      console.log(`✅ Snapshot restored: ${snapshotId}`);
      return true;
    } catch (error) {
      console.error(`❌ Restore failed: ${error.message}`);
      throw error;
    }
  }

  listSnapshots() {
    const snapshots = fs.readdirSync(this.backupDir)
      .filter(item => fs.statSync(path.join(this.backupDir, item)).isDirectory())
      .map(id => {
        const manifestPath = path.join(this.backupDir, id, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        }
        return { id, timestamp: 'unknown', description: 'Legacy backup' };
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return snapshots;
  }

  async preChangeBackup(changeDescription) {
    return await this.createSnapshot(`PRE_CHANGE_${changeDescription}`);
  }

  async postChangeBackup(changeDescription) {
    return await this.createSnapshot(`POST_CHANGE_${changeDescription}`);
  }
}

// CLI Interface
if (require.main === module) {
  const backup = new BackupSystem();
  const [,, command, ...args] = process.argv;

  (async () => {
    try {
      switch (command) {
        case 'create':
          const description = args.join(' ') || 'Manual backup';
          await backup.createSnapshot(description);
          break;
        case 'restore':
          const snapshotId = args[0];
          if (!snapshotId) {
            console.error('Please provide snapshot ID');
            process.exit(1);
          }
          await backup.restoreSnapshot(snapshotId);
          break;
        case 'list':
          const snapshots = backup.listSnapshots();
          console.log('\n📋 Available Snapshots:');
          snapshots.forEach(s => {
            console.log(`  ${s.id} - ${s.description} (${s.timestamp})`);
          });
          break;
        case 'pre-change':
          const changeDesc = args.join(' ') || 'Unknown change';
          await backup.preChangeBackup(changeDesc);
          break;
        default:
          console.log(`
Usage: node backup-system.js <command> [args]

Commands:
  create [description]     Create a new backup snapshot
  restore <snapshot-id>    Restore from a backup snapshot
  list                     List all available snapshots
  pre-change <description> Create pre-change backup
          `);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = BackupSystem;