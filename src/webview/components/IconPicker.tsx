import { useState, useRef, useEffect } from 'react';

const CODICONS = [
  'folder', 'file', 'file-code', 'code', 'terminal', 'gear', 'star-full',
  'heart', 'flame', 'rocket', 'zap', 'bug', 'beaker', 'globe', 'cloud',
  'database', 'server', 'lock', 'key', 'shield-', 'eye', 'bookmark', 'tag',
  'pin', 'bell', 'megaphone', 'tools', 'wrench', 'lightbulb', 'puzzle-piece',
  'extensions', 'package', 'archive', 'inbox', 'mail', 'comment', 'people',
  'person', 'organization', 'home', 'compass', 'map', 'location', 'calendar',
  'clock', 'history', 'sync', 'refresh', 'play', 'debug', 'run-all',
  'notebook', 'library', 'book', 'mortar-board', 'telescope', 'microscope',
  'robot', 'smiley', 'thumbsup', 'check', 'circle-filled', 'diamond',
  'triangle-up', 'symbol-property', 'symbol-misc', 'symbol-method',
  'symbol-interface', 'coffee', 'ruby', 'layers', 'git-branch',
  'source-control', 'repo', 'github-inverted', 'milestone', 'circuit-board',
  'vm', 'wand', 'paintcan', 'music', 'game', 'pie-chart', 'graph',
  'workspace-trusted', 'verified', 'sparke', 'squirrel',
];

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
    ? CODICONS.filter((name) => name.includes(search.toLowerCase()))
    : CODICONS;

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
      </div>
      {filtered.length === 0 && (
        <div className="icon-picker__empty">No icons matching "{search}"</div>
      )}
    </div>
  );
}
