# DASHBOARD COMPONENT BACKUP
## Critical Layout Elements Protection

### IMPORTANT: READ BEFORE ANY MAJOR CHANGES
This file contains backup layouts for critical dashboard components to prevent accidental deletion of UI elements.

## DesktopDashboard Header Layout (PROTECTED)
**Last Updated:** July 4, 2025
**Status:** ACTIVE - DO NOT DELETE

### Header Structure:
```jsx
<header className="header-wireframe">
  {/* LEFT: Logo */}
  <div className="logo-section">
    <a href="/" className="logo-link">
      <img src="/logo.svg" alt="LocalAI Builder" className="dashboard-logo" />
    </a>
  </div>
  
  {/* CENTER: Main Action Buttons */}
  <div className="header-center">
    <button className="btn-primary" onClick={() => window.open('/', '_blank')}>
      + New Site
    </button>
    <button className="btn-wireframe" onClick={() => console.log('Save clicked')}>
      Save
    </button>
    <button className="btn-wireframe" onClick={() => window.postMessage({type: 'undo'}, '*')}>
      ↶ Undo
    </button>
    <button className="btn-wireframe" onClick={() => window.postMessage({type: 'redo'}, '*')}>
      ↷ Redo
    </button>
  </div>

  {/* RIGHT: Credits & Secondary Actions */}
  <div className="header-actions">
    <div className="credits-info">
      <span className="credits-label">Credits remaining: <strong>25</strong></span>
    </div>
    <div className="dropdown-wrapper">
      <button className="btn-wireframe" onClick={() => setShowPagesDropdown(!showPagesDropdown)}>
        Pages ▼
      </button>
      {/* Dropdown content */}
    </div>
    <button className="btn-wireframe">🔔</button>
    <button className="btn-wireframe">Publish</button>
    <button className="btn-wireframe" onClick={handleLogout}>Logout</button>
  </div>
</header>
```

### Required CSS Classes:
- `.header-wireframe` - Main header container
- `.logo-section` - Left logo area (flex: 0 0 auto)
- `.header-center` - Center buttons area (flex: 1, justify-content: center)
- `.header-actions` - Right actions area (flex: 0 0 auto)
- `.credits-info` - Credits display box
- `.btn-primary` - Yellow primary button (#ffc000)
- `.btn-wireframe` - Standard gray buttons

### Critical Elements (NEVER DELETE):
1. **+ New Site** button (center, yellow)
2. **Save** button (center)
3. **↶ Undo** button (center, connected to editor)
4. **↷ Redo** button (center, connected to editor)
5. **Credits remaining** display (right)
6. **Pages ▼** dropdown (right)
7. **🔔** notification bell (right)
8. **Publish** button (right)
9. **Logout** button (right)

## Protection Rules:
1. **BACKUP FIRST**: Always create component backup before major changes
2. **VERIFY ELEMENTS**: Check all buttons exist after any layout change
3. **TEST FUNCTIONALITY**: Ensure Undo/Redo connects to editor system
4. **DOCUMENT CHANGES**: Update this file with any modifications
5. **ROLLBACK PLAN**: Keep previous working version available

## Recovery Process:
If buttons are accidentally deleted:
1. Check this backup file for complete structure
2. Restore missing elements from backup
3. Verify CSS classes are present
4. Test all button functionality
5. Update changelog in replit.md

## Change Log:
- July 4, 2025: Created protection system after accidental button deletion
- July 4, 2025: Restored original dashboard header with all buttons