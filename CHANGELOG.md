# Changelog

## [0.2.10] - 2026-02-07

### Fixed

- Active project dots not updating when windows close — stale entries lingered for 24 hours; now cleaned up within 3 minutes via a heartbeat mechanism
- Tag view first project spacing now matches the ungrouped projects list

## [0.2.9] - 2026-02-07

### Changed

- Updated DevEmbers logo

## [0.2.8] - 2026-02-07

### Fixed

- Remote tab padding — first SSH card now has consistent spacing on all sides
- Remote path `code` element styled with horizontal padding, reduced border-radius, and inline-block display
- Ungrouped projects no longer touch the search bar — added top spacing when no group header precedes them

## [0.2.7] - 2026-02-07

### Added

- Editable remote paths on Remote tab cards — click the path line to edit inline, Enter/blur saves, Escape cancels
- Remote paths persisted in `projects.json` under a `remote` key, surviving reloads and config changes
- Edit icon appears on card hover to indicate the path is clickable

### Changed

- Remote path source changed from `#RemotePath` SSH config comments to stored paths in `projects.json`
- Path priority: stored path > derived `/home/<user>` > `/` (with warning icon)
- Derived paths no longer include a trailing slash (e.g. `/home/alice` instead of `/home/alice/`)

### Removed

- `#RemotePath` SSH config comment parsing — paths are now managed directly in the UI

## [0.2.6] - 2026-02-07

### Added

- Path autocomplete in the Add Project local folder input — type a path and get directory suggestions in a dropdown
- Fuzzy matching: prefix matches sorted first, then substring matches (top 5 shown)
- Keyboard navigation for suggestions (Arrow keys, Enter to select, Escape to dismiss)
- Selecting a suggestion fills the path and immediately shows subdirectories
- Hidden directories (dotfiles) only shown when the typed fragment starts with `.`
- Tilde expansion (`~` / `~/`) resolves to home directory

## [0.2.5] - 2026-02-07

### Added

- New **Remote** tab in the sidebar — lists SSH hosts from `~/.ssh/config` as cards, click to connect in a new window
- SSH host cards show all config details (hostname, user, identity file, control settings, etc.)
- Hosts sharing the same connection are deduplicated into a single card with all aliases listed
- Recommendation banner in the Add Project SSH tab suggesting the Remote tab for a better workflow

### Changed

- SSH config parser now captures all directives (ControlMaster, ServerAliveInterval, etc.), not just core fields

## [0.2.4] - 2026-02-06

### Added

- Name field in the Add Project form — auto-derived from the folder path, fully editable before saving
- Emoji search by name (e.g. search "japan", "rocket", "dog" instead of scrolling)
- Press Enter in Name or Path fields to save project configuration
- Group input shows existing groups as suggestions when focused

### Fixed

- Removed nested scrollbars from the icon picker grid

- Codicon icons not vertically centered in their containers (close button, etc.)
- KEY/value placeholder text misaligned in environment variable inputs
- Action button tooltips clipped behind the toolbar on top project rows
- Clearing the group field and pressing Enter now correctly saves

## [0.2.3] - 2026-02-06

### Added

- Flag emojis in the emoji picker (230+ country flags)
- Expanded icon picker from 77 to 500+ Codicons organized in 12 categories

### Changed

- Project names are now auto-titled from folder names (e.g. "my-cool-project" → "My Cool Project")

## [0.2.2] - 2026-02-06

### Added

- Elastic License 2.0
- Open VSX registry publishing support
- Marketplace Q&A section enabled

### Changed

- Improved marketplace discoverability (expanded keywords, optimized display name and description)

## [0.2.1] - 2026-02-06

### Added

- Alt+click a project row to open it in a new window

## [0.2.0] - 2026-02-06

### Added

- Rename groups by double-clicking the group name in the sidebar
- Press Enter in the Group field of project configuration to save
- New marketplace icon (Lucide briefcase-business)

### Fixed

- Tooltips on toolbar action buttons no longer render behind the search bar

### Changed

- Default sort order is now "Name" instead of "Recency" for new users

## [0.1.0] - Initial Release

### Added

- Manage projects with groups, tags, and favorites
- Hierarchical group organization with collapse/expand
- Inline project renaming (double-click)
- Sort by name or recency
- Tag-based filtering with color support
- SSH remote project support
- Custom icons and emoji per project
- Per-project environment variables and terminal profiles
- Status bar integration
- Keyboard shortcut to focus sidebar (Cmd+Alt+P / Ctrl+Alt+P)
