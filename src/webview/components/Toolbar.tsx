import type { ViewMode } from '../App.js';
import type { WebViewConfig, SortBy } from '../../shared/protocol.js';
import { SearchBar } from './SearchBar.js';
import { IconButton } from './IconButton.js';
import { postMessage } from '../vscodeApi.js';

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  config: WebViewConfig;
  onAddProject: () => void;
  allCollapsed?: boolean;
  onToggleAllGroups?: () => void;
}

const TABS: { mode: ViewMode; label: string; icon: string }[] = [
  { mode: 'groups', label: 'Groups', icon: 'folder' },
  { mode: 'tags', label: 'Tags', icon: 'tag' },
];

const SORT_CYCLE: SortBy[] = ['recency', 'name'];
const SORT_LABELS: Record<SortBy, string> = {
  recency: 'Recent',
  name: 'Name',
};
const SORT_ICONS: Record<SortBy, string> = {
  recency: 'history',
  name: 'case-sensitive',
};

export function Toolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  config,
  onAddProject,
  allCollapsed,
  onToggleAllGroups,
}: ToolbarProps) {
  const cycleSortBy = () => {
    const idx = SORT_CYCLE.indexOf(config.sortBy);
    const next = SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
    postMessage({ type: 'action:updateConfig', key: 'sortBy', value: next });
  };

  return (
    <div className="toolbar">
      <div className="toolbar-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.mode}
            className={`toolbar-tab ${viewMode === tab.mode ? 'toolbar-tab--active' : ''}`}
            onClick={() => onViewModeChange(tab.mode)}
          >
            <span className={`codicon codicon-${tab.icon}`} /> {tab.label}
          </button>
        ))}
      </div>
      <div className="toolbar-row">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
        <IconButton
          icon={SORT_ICONS[config.sortBy]}
          title={`Sort: ${SORT_LABELS[config.sortBy]}`}
          onClick={cycleSortBy}
        />
        {viewMode === 'groups' && onToggleAllGroups && (
          <IconButton
            icon={allCollapsed ? 'expand-all' : 'collapse-all'}
            title={allCollapsed ? 'Expand All' : 'Collapse All'}
            onClick={onToggleAllGroups}
          />
        )}
        {viewMode === 'groups' && (
          <IconButton icon="add" title="Add Project" onClick={onAddProject} />
        )}
      </div>
    </div>
  );
}
