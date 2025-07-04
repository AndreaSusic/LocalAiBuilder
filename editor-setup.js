/**
 * EDITOR SETUP CONFIGURATION
 * Saves and loads editor settings for consistent behavior
 */

const fs = require('fs');
const path = require('path');

class EditorSetup {
  constructor() {
    this.configFile = path.join(__dirname, 'editor-config.json');
    this.defaultConfig = {
      version: '1.0.0',
      enableInlineEditing: true,
      autoSave: true,
      autoSaveInterval: 2000,
      showRedDots: true,
      enableToolbar: true,
      enableAIChat: true,
      enableColorPicker: true,
      enableVideoUpload: true,
      enableImageUpload: true,
      keyboardShortcuts: {
        save: 'Ctrl+S',
        undo: 'Ctrl+Z',
        redo: 'Ctrl+Y',
        bold: 'Ctrl+B',
        italic: 'Ctrl+I',
        underline: 'Ctrl+U'
      },
      toolbarButtons: [
        'bold', 'italic', 'underline', 'color', 'background',
        'heading', 'list', 'image', 'video', 'ai-chat',
        'delete', 'undo', 'redo'
      ],
      aiChatEndpoint: '/api/ai-chat',
      previewRoutes: ['/preview', '/t/v1/'],
      excludeSelectors: [
        '.no-edit', '.system-ui', '.toolbar', '.chat-container'
      ],
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        this.config = { ...this.defaultConfig, ...config };
        console.log('✅ Editor configuration loaded');
      } else {
        this.config = { ...this.defaultConfig };
        this.saveConfig();
        console.log('🔧 Default editor configuration created');
      }
    } catch (error) {
      console.error('❌ Failed to load editor config:', error.message);
      this.config = { ...this.defaultConfig };
    }
  }

  saveConfig() {
    try {
      this.config.lastModified = new Date().toISOString();
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
      console.log('💾 Editor configuration saved');
      return true;
    } catch (error) {
      console.error('❌ Failed to save editor config:', error.message);
      return false;
    }
  }

  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
    return this.saveConfig();
  }

  getConfig() {
    return { ...this.config };
  }

  generateEditorScript() {
    const config = this.getConfig();
    
    return `
<!-- EDITOR BRIDGE CONFIGURATION -->
<script>
window.EDITOR_CONFIG = ${JSON.stringify(config, null, 2)};
</script>

<!-- EDITOR BRIDGE SCRIPT -->
<script>
// Initialize editor with saved configuration
(function() {
  const config = window.EDITOR_CONFIG;
  
  if (!config.enableInlineEditing) {
    console.log('🚫 Inline editing disabled by configuration');
    return;
  }

  // Check if we're in a preview context
  const isPreview = config.previewRoutes.some(route => 
    window.location.pathname.includes(route)
  );
  
  if (!isPreview) {
    console.log('🚫 Not in preview context, skipping editor injection');
    return;
  }

  // Load editor bridge script
  const script = document.createElement('script');
  script.src = '/editorBridge.js';
  script.onload = () => {
    console.log('✅ Editor bridge loaded with configuration');
    
    // Initialize with config
    if (window.initEditorBridge) {
      window.initEditorBridge(config);
    }
  };
  document.head.appendChild(script);
})();
</script>
`;
  }

  generateCSSConfig() {
    const config = this.getConfig();
    
    return `
/* EDITOR CONFIGURATION STYLES */
.editor-enabled {
  position: relative;
}

.editor-enabled[data-editable="true"]:hover {
  outline: ${config.showRedDots ? '2px dashed #ff0000' : 'none'} !important;
  cursor: text;
}

.editor-enabled[data-editable="true"].editing {
  outline: 2px solid #ffc000 !important;
  background: rgba(255, 192, 0, 0.1);
}

.editor-toolbar {
  display: ${config.enableToolbar ? 'flex' : 'none'};
  position: absolute;
  top: -40px;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 10000;
  padding: 4px;
  gap: 4px;
}

.editor-toolbar button {
  padding: 4px 8px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  border-radius: 3px;
  font-size: 12px;
}

.editor-toolbar button:hover {
  background: #e0e0e0;
}

.ai-chat-panel {
  display: ${config.enableAIChat ? 'block' : 'none'};
}

.editor-delete-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 20px;
  height: 20px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
`;
  }

  generatePreviewInjection() {
    return `
<!-- PREVIEW EDITOR INJECTION -->
<script>
${this.generateEditorScript()}
</script>

<style>
${this.generateCSSConfig()}
</style>
`;
  }

  exportConfig() {
    const config = this.getConfig();
    const exportData = {
      ...config,
      exportedAt: new Date().toISOString(),
      exportedBy: 'LocalAI Builder Editor Setup'
    };
    
    const exportFile = path.join(__dirname, `editor-config-export-${Date.now()}.json`);
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
    
    console.log(`📤 Configuration exported to: ${exportFile}`);
    return exportFile;
  }

  importConfig(configFile) {
    try {
      const importedConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      
      // Merge with current config, preserving important fields
      const mergedConfig = {
        ...this.config,
        ...importedConfig,
        imported: new Date().toISOString(),
        importedFrom: configFile
      };
      
      this.config = mergedConfig;
      this.saveConfig();
      
      console.log(`📥 Configuration imported from: ${configFile}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to import config:', error.message);
      return false;
    }
  }

  resetToDefaults() {
    this.config = { ...this.defaultConfig };
    this.saveConfig();
    console.log('🔄 Configuration reset to defaults');
    return true;
  }
}

// CLI Interface
if (require.main === module) {
  const editor = new EditorSetup();
  const [,, command, ...args] = process.argv;

  (async () => {
    try {
      switch (command) {
        case 'show':
          console.log('\n📋 Current Editor Configuration:');
          console.log(JSON.stringify(editor.getConfig(), null, 2));
          break;
        case 'save':
          editor.saveConfig();
          break;
        case 'export':
          const exportFile = editor.exportConfig();
          console.log(`Configuration exported to: ${exportFile}`);
          break;
        case 'import':
          const configFile = args[0];
          if (!configFile) {
            console.error('Please provide config file path');
            process.exit(1);
          }
          editor.importConfig(configFile);
          break;
        case 'reset':
          editor.resetToDefaults();
          break;
        case 'update':
          const updates = {};
          for (let i = 0; i < args.length; i += 2) {
            const key = args[i];
            const value = args[i + 1];
            if (key && value !== undefined) {
              updates[key] = value === 'true' ? true : value === 'false' ? false : value;
            }
          }
          editor.updateConfig(updates);
          console.log('✅ Configuration updated');
          break;
        default:
          console.log(`
Usage: node editor-setup.js <command> [args]

Commands:
  show                    Show current configuration
  save                    Save current configuration
  export                  Export configuration to file
  import <config-file>    Import configuration from file
  reset                   Reset to default configuration
  update <key> <value>    Update specific configuration value
          `);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = EditorSetup;