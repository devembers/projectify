import { useState, useRef, useEffect } from 'react';

const ICON_GROUPS: { label: string; icons: string[] }[] = [
  {
    label: 'Development',
    icons: [
      'code', 'file-code', 'terminal', 'terminal-bash', 'terminal-cmd',
      'terminal-debian', 'terminal-linux', 'terminal-powershell', 'terminal-tmux',
      'terminal-ubuntu', 'terminal-git-bash', 'debug', 'debug-alt', 'debug-console',
      'debug-coverage', 'bug', 'beaker', 'microscope', 'telescope', 'robot',
      'wand', 'lightbulb', 'lightbulb-autofix', 'lightbulb-sparkle', 'lightbulb-empty',
      'variable', 'symbol-variable', 'symbol-method', 'symbol-function',
      'symbol-constructor', 'symbol-class', 'symbol-interface', 'symbol-enum',
      'symbol-constant', 'symbol-field', 'symbol-property', 'symbol-key',
      'symbol-string', 'symbol-numeric', 'symbol-boolean', 'symbol-array',
      'symbol-object', 'symbol-module', 'symbol-namespace', 'symbol-package',
      'symbol-event', 'symbol-operator', 'symbol-snippet', 'symbol-file',
      'symbol-reference', 'symbol-keyword', 'symbol-color', 'symbol-ruler',
      'symbol-unit', 'symbol-misc', 'symbol-type-parameter', 'symbol-enum-member',
      'symbol-struct', 'symbol-method-arrow', 'bracket', 'bracket-dot',
      'bracket-error', 'regex', 'json',
    ],
  },
  {
    label: 'Git & Source Control',
    icons: [
      'git-branch', 'git-branch-create', 'git-branch-delete', 'git-commit',
      'git-compare', 'git-merge', 'git-pull-request', 'git-pull-request-create',
      'git-pull-request-closed', 'git-pull-request-draft', 'git-pull-request-label',
      'git-pull-request-new-changes', 'git-pull-request-go-to-changes',
      'git-pull-request-done', 'git-stash', 'git-stash-apply', 'git-stash-pop',
      'git-fetch', 'git-fork-private', 'source-control', 'compare-changes',
      'diff', 'diff-added', 'diff-modified', 'diff-removed', 'diff-renamed',
      'diff-single', 'diff-multiple', 'repo', 'repo-clone', 'repo-push',
      'repo-pull', 'repo-force-push', 'repo-fetch', 'repo-pinned', 'repo-selected',
      'merge', 'merge-into',
    ],
  },
  {
    label: 'Files & Folders',
    icons: [
      'file', 'file-add', 'file-binary', 'file-code', 'file-media', 'file-pdf',
      'file-submodule', 'file-symlink-file', 'file-symlink-directory', 'file-zip',
      'file-text', 'files', 'folder', 'folder-active', 'folder-opened',
      'folder-library', 'new-file', 'new-folder', 'root-folder',
      'root-folder-opened', 'go-to-file',
    ],
  },
  {
    label: 'UI & Layout',
    icons: [
      'layout', 'layout-activitybar-left', 'layout-activitybar-right',
      'layout-panel', 'layout-panel-left', 'layout-panel-center',
      'layout-panel-right', 'layout-panel-justify', 'layout-panel-off',
      'layout-panel-dock', 'layout-sidebar-left', 'layout-sidebar-right',
      'layout-sidebar-left-off', 'layout-sidebar-right-off',
      'layout-sidebar-left-dock', 'layout-sidebar-right-dock',
      'layout-statusbar', 'layout-menubar', 'layout-centered',
      'split-horizontal', 'split-vertical', 'empty-window', 'multiple-windows',
      'window', 'window-active', 'screen-full', 'screen-normal',
      'editor-layout', 'preview', 'open-preview',
    ],
  },
  {
    label: 'Actions',
    icons: [
      'play', 'run', 'run-all', 'run-above', 'run-below', 'run-errors',
      'run-coverage', 'run-all-coverage', 'run-with-deps', 'debug-start',
      'debug-stop', 'debug-pause', 'debug-continue', 'debug-step-into',
      'debug-step-out', 'debug-step-over', 'debug-step-back', 'debug-restart',
      'debug-restart-frame', 'debug-reverse-continue', 'debug-rerun',
      'debug-line-by-line', 'debug-all', 'record', 'record-small', 'stop',
      'stop-circle', 'play-circle', 'refresh', 'sync', 'redo',
      'search', 'search-save', 'search-stop', 'search-fuzzy', 'search-sparkle',
      'search-large', 'filter', 'filter-filled', 'sort-precedence',
      'sort-percentage', 'expand-all', 'collapse-all', 'fold', 'fold-up',
      'fold-down', 'unfold', 'list-ordered', 'list-unordered', 'list-tree',
      'list-flat', 'list-filter', 'list-selection',
    ],
  },
  {
    label: 'Navigation',
    icons: [
      'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
      'arrow-small-up', 'arrow-small-down', 'arrow-small-left', 'arrow-small-right',
      'arrow-circle-up', 'arrow-circle-down', 'arrow-circle-left', 'arrow-circle-right',
      'arrow-both', 'arrow-swap', 'chevron-up', 'chevron-down', 'chevron-left',
      'chevron-right', 'triangle-up', 'triangle-down', 'triangle-left',
      'triangle-right', 'forward',
    ],
  },
  {
    label: 'Objects',
    icons: [
      'gear', 'settings-gear', 'tools', 'wrench', 'wrench-subaction',
      'key', 'lock', 'lock-small', 'unlock', 'shield', 'eye', 'eye-closed',
      'bookmark', 'tag', 'tag-add', 'tag-remove', 'pin', 'pinned', 'pinned-dirty',
      'bell', 'bell-dot', 'bell-slash', 'bell-slash-dot', 'megaphone',
      'mail', 'mail-read', 'mail-reply', 'inbox', 'comment', 'comment-add',
      'comment-discussion', 'comment-draft', 'comment-unresolved',
      'comment-discussion-sparkle', 'comment-discussion-quote',
      'package', 'archive', 'unarchive', 'gift', 'credit-card', 'link',
      'link-external', 'plug', 'calendar', 'clock', 'clockface', 'history',
      'notebook', 'notebook-template', 'library', 'book', 'law', 'quote',
      'quotes', 'note', 'clipboard', 'tasklist', 'checklist',
    ],
  },
  {
    label: 'People & Social',
    icons: [
      'person', 'person-add', 'person-filled', 'people', 'organization',
      'organization-filled', 'account', 'smiley', 'heart', 'heart-filled',
      'thumbsup', 'thumbsup-filled', 'thumbsdown', 'thumbsdown-filled',
      'feedback', 'mention', 'reactions', 'live-share', 'share',
    ],
  },
  {
    label: 'Infrastructure',
    icons: [
      'globe', 'cloud', 'cloud-download', 'cloud-upload', 'cloud-small',
      'database', 'server', 'server-process', 'server-environment',
      'vm', 'vm-active', 'vm-outline', 'vm-running', 'vm-connect',
      'vm-pending', 'vm-small', 'remote', 'remote-explorer', 'circuit-board',
      'chip', 'azure', 'azure-devops',
    ],
  },
  {
    label: 'Status & Indicators',
    icons: [
      'check', 'check-all', 'close', 'x', 'error', 'error-small', 'warning',
      'alert', 'info', 'question', 'issue-opened', 'issue-closed', 'issue-draft',
      'issue-reopened', 'issues', 'circle-filled', 'circle-outline',
      'circle-large-filled', 'circle-large-outline', 'circle-small',
      'circle-small-filled', 'circle-slash', 'pass', 'pass-filled',
      'verified', 'verified-filled', 'unverified', 'flag',
      'loading', 'pulse', 'broadcast', 'rss',
      'workspace-trusted', 'workspace-untrusted', 'workspace-unknown',
    ],
  },
  {
    label: 'AI & Copilot',
    icons: [
      'copilot', 'copilot-large', 'copilot-warning', 'copilot-warning-large',
      'copilot-blocked', 'copilot-not-connected', 'copilot-unavailable',
      'copilot-in-progress', 'copilot-error', 'copilot-success', 'copilot-snooze',
      'sparkle', 'sparkle-filled', 'chat-sparkle', 'chat-sparkle-warning',
      'chat-sparkle-error', 'edit-sparkle', 'agent', 'mcp', 'thinking',
    ],
  },
  {
    label: 'Misc',
    icons: [
      'rocket', 'flame', 'zap', 'coffee', 'ruby', 'snake', 'python',
      'game', 'vr', 'piano', 'music', 'squirrel', 'octoface',
      'github-inverted', 'github-action', 'github-project',
      'vscode', 'vscode-insiders', 'code-oss',
      'home', 'compass', 'compass-dot', 'compass-active',
      'map', 'map-filled', 'map-horizontal', 'map-horizontal-filled',
      'map-vertical', 'map-vertical-filled', 'location', 'target',
      'layers', 'layers-dot', 'layers-active', 'paintcan', 'color-mode',
      'bold', 'italic', 'strikethrough', 'horizontal-rule', 'text-size',
      'markdown', 'whole-word', 'word-wrap', 'indent', 'newline', 'whitespace',
      'diamond', 'star-full', 'star-half', 'star-empty', 'star-add', 'star-delete',
      'milestone', 'graph', 'graph-left', 'graph-line', 'graph-scatter',
      'pie-chart', 'percentage', 'table', 'magnet',
      'briefcase', 'mortar-board', 'project', 'dashboard',
      'send', 'send-to-remote-agent', 'export', 'download',
      'desktop-download', 'save', 'save-all', 'save-as',
      'copy', 'clone', 'edit', 'edit-code', 'pencil', 'rename', 'eraser',
      'cursor', 'move', 'discard', 'clear-all', 'trash', 'close-all',
      'exclude', 'surround-with', 'insert', 'attach', 'grab', 'grabber',
      'gripper', 'three-bars', 'kebab-horizontal', 'kebab-vertical',
      'ellipsis', 'more', 'menu', 'blank', 'dash',
      'zoom-in', 'zoom-out', 'inspect', 'mic', 'mic-filled', 'mute', 'unmute',
      'sign-in', 'sign-out', 'device-camera', 'device-camera-video',
      'device-mobile', 'browser', 'chrome-close', 'chrome-maximize',
      'chrome-minimize', 'chrome-restore',
      'collection', 'collection-small', 'new-collection',
      'type-hierarchy', 'type-hierarchy-sub', 'type-hierarchy-super',
      'group-by-ref-type', 'ungroup-by-ref-type', 'variable-group',
      'combine', 'gather', 'output', 'build', 'skip',
      'session-in-progress', 'go-to-editing-session',
      'code-review', 'coverage', 'case-sensitive', 'preserve-case',
      'replace', 'replace-all', 'versions', 'index-zero',
    ],
  },
];

const ALL_ICONS = ICON_GROUPS.flatMap((g) => g.icons);

interface IconPickerProps {
  currentIcon: string | null;
  onSelect: (icon: string | null) => void;
  onClose: () => void;
}

export function IconPicker({ currentIcon, onSelect, onClose }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = search
    ? ALL_ICONS.filter((name) => name.includes(search.toLowerCase()))
    : null;

  return (
    <div className="icon-picker" ref={ref} onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        className="icon-picker__search"
        type="text"
        placeholder="Search icons..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {currentIcon && (
        <button
          className="icon-picker__reset"
          onClick={() => onSelect(null)}
        >
          <span className="codicon codicon-discard" /> Reset to default
        </button>
      )}
      <div className="emoji-picker__scroll">
        {filtered ? (
          <div className="icon-picker__grid">
            {filtered.map((name) => (
              <button
                key={name}
                className={`icon-picker__item ${currentIcon === name ? 'icon-picker__item--selected' : ''}`}
                title={name}
                onClick={() => onSelect(name)}
              >
                <span className={`codicon codicon-${name}`} />
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="icon-picker__empty">No icons matching "{search}"</div>
            )}
          </div>
        ) : (
          ICON_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="emoji-picker__group-label">{group.label}</div>
              <div className="icon-picker__grid">
                {group.icons.map((name) => (
                  <button
                    key={name}
                    className={`icon-picker__item ${currentIcon === name ? 'icon-picker__item--selected' : ''}`}
                    title={name}
                    onClick={() => onSelect(name)}
                  >
                    <span className={`codicon codicon-${name}`} />
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
