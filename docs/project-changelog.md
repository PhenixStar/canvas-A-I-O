# Project Changelog

This document records all significant changes, features, and fixes in AIO Canvas.

---

## [1.0.0] - 2025-02-06

### Phase 3: Desktop Persistence UI Components - ✅ COMPLETED

#### Features Added

**UI Components** (528 LOC total)
- ✅ `components/recent-files-menu.tsx` (168 LOC)
  - Dropdown menu displaying recently opened files
  - Thumbnail support for diagram previews
  - File reading via Electron API
  - Loading states and error handling
  - Dual-mode support (web/Electron)

- ✅ `components/diagram-history-dialog.tsx` (220 LOC)
  - Enhanced dialog for viewing and restoring diagram versions
  - Search functionality by version and date
  - Grid layout for version preview
  - Restore confirmation dialogs

- ✅ `components/auto-save-restore-dialog.tsx` (200 LOC)
  - Crash recovery dialog for auto-saved versions
  - Lists auto-saved versions with timestamps
  - Restore/discard/keep working options
  - `useAutoSaveRecovery` hook for startup checks

- ✅ `components/persistence-ui.tsx` (13 LOC)
  - Export barrel file for persistence UI components
  - Centralized imports

- ✅ `components/ui/dropdown-menu.tsx` (250 LOC)
  - Radix UI dropdown menu component wrapper
  - Full TypeScript implementation

**Electron File Reading** (65 LOC)
- ✅ `electron/main/persistence-handlers.ts`
  - `readFile` IPC handler with security validation
  - `fileExists` IPC handler
  - Path resolution to prevent directory traversal
  - File system imports (fs, path)

**Preload API** (6 LOC)
- ✅ `electron/preload/persistence-api.ts`
  - Exposed file operations to renderer process
  - Type-safe IPC communication

**TypeScript Definitions** (6 LOC)
- ✅ `electron/electron.d.ts`
  - Updated PersistenceAPI interface
  - Added file operation signatures

**Main Application Integration** (~100 LOC)
- ✅ `components/chat-panel.tsx`
  - Integrated Recent Files button in toolbar
  - Integrated Diagram History button in toolbar
  - Added dialog state management
  - Placed dialogs at component root

**Dependencies Added**
- ✅ `date-fns@^4.1.0` - Relative time formatting
- ✅ `@radix-ui/react-dropdown-menu@^2.1.16` - Dropdown menu primitive

**Translations** (18 keys × 4 languages = 72 entries)
- ✅ English (`lib/i18n/dictionaries/en.json`)
- ✅ Chinese (`lib/i18n/dictionaries/zh.json`)
- ✅ Japanese (`lib/i18n/dictionaries/ja.json`)
- ✅ Traditional Chinese (`lib/i18n/dictionaries/zh-Hant.json`)

**Desktop Build**
- ✅ Windows executable built successfully
  - `Next AI Draw.io Setup 1.0.0.exe` (209MB) - NSIS installer
  - `Next AI Draw.io 1.0.0.exe` (209MB) - Portable version
  - Built for x64 and arm64 architectures
  - Native module compilation (better-sqlite3) successful

**Documentation**
- ✅ `docs/phase-3-integration.md` (335 LOC)
  - Comprehensive integration guide
  - Usage examples for all components
  - Electron integration notes
  - Testing checklist

#### Technical Implementation

**Security Features**
- Path resolution for file reading prevents directory traversal
- Electron safeStorage for encrypted API keys
- Zod validation for IPC message integrity

**Performance Optimizations**
- React.memo for component memoization
- Lazy loading of history entries
- Debounced search functionality
- Efficient state management

**Accessibility**
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support

#### Bug Fixes

- Fixed missing dropdown-menu component (created full implementation)
- Fixed invalid icon import (Discard → Trash2)
- Fixed TypeScript fetch signature error in ai-providers.ts
- Fixed missing translation keys (added to all 4 languages)
- Fixed linting errors (unused variables, imports, missing SVG titles)
- Fixed Biome linting issues (pre-commit hook compliance)

#### Testing

- All 66 tests passing
- Build successful with zero errors
- Type checking: No TypeScript errors
- Linting: All checks passing

#### Documentation Updates

- ✅ README.md - Marked Phase 3 as complete
- ✅ docs/project-roadmap.md - Updated progress status
- ✅ docs/system-architecture-core.md - Added file reading architecture
- ✅ docs/deployment-guide.md - Added desktop build instructions
- ✅ docs/phase-3-integration.md - Comprehensive integration guide

---

## [0.9.0] - 2024-Q4

### Phase 2: Desktop Persistence Backend - ✅ COMPLETED

#### Features Added

**Database Layer**
- SQLite database schema implementation
- 10 storage modules created (1,220 LOC)
- Database initialization and migration support

**IPC Communication**
- 14 IPC channels implemented
- Type-safe message passing with Zod validation
- Error handling and recovery

**React Integration**
- 4 custom hooks created
- Diagram context integration
- State management for persistence

**Security**
- API key encryption via Electron safeStorage
- Path validation for file operations
- Secure data persistence

---

## [0.5.0] - 2024-Q2

### Phase 1: Foundation - ✅ COMPLETED

#### Features Added

- Next.js 16 web application
- React 19 with TypeScript
- Basic draw.io integration
- Single AI provider support (OpenAI)
- Simple chat interface
- Import/export functionality
- Multi-language support (EN, CN, JA)

---

## Version History

| Version | Date | Phase | Status |
|---------|------|-------|--------|
| 1.0.0 | 2025-02-06 | Phase 3 | ✅ Complete |
| 0.9.0 | 2024-Q4 | Phase 2 | ✅ Complete |
| 0.5.0 | 2024-Q2 | Phase 1 | ✅ Complete |

---

*Last updated: 2025-02-06*
