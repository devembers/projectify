import { useState, useEffect, useCallback, useMemo } from 'react';
import { postMessage, onMessage, getPersistedState, setPersistedState } from './vscodeApi.js';
import type { Project, Tag, SSHHost } from '../types.js';
import type { WebViewConfig, HostToWebviewMessage } from '../shared/protocol.js';
import { Toolbar } from './components/Toolbar.js';
import { ProjectList } from './components/ProjectList.js';
import { EmptyState } from './components/EmptyState.js';
import { TagFilterView } from './components/TagFilterView.js';
import { AddProjectPanel } from './components/AddProjectPanel.js';
import { ProjectConfigPanel } from './components/ProjectConfigPanel.js';
import { RemoteView } from './components/RemoteView.js';

export type ViewMode = 'groups' | 'tags' | 'remote';

interface PersistedState {
  viewMode: ViewMode;
  searchQuery: string;
  collapsedGroups: string[];
  selectedFilterTags: string[];
}

const DEFAULT_CONFIG: WebViewConfig = {
  sortBy: 'name',
};

export function App() {
  const persisted = getPersistedState<PersistedState>();

  const [initialized, setInitialized] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [config, setConfig] = useState<WebViewConfig>(DEFAULT_CONFIG);
  const [currentProjectPath, setCurrentProjectPath] = useState<string | null>(null);
  const [activeProjectPaths, setActiveProjectPaths] = useState<string[]>([]);
  const [sshHosts, setSshHosts] = useState<SSHHost[]>([]);
  const [remotePaths, setRemotePaths] = useState<Record<string, string>>({});

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = persisted?.viewMode as string | undefined;
    if (saved === 'groups' || saved === 'tags' || saved === 'remote') return saved;
    return 'groups';
  });
  const [searchQuery, setSearchQuery] = useState(persisted?.searchQuery ?? '');
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>(
    persisted?.collapsedGroups ?? [],
  );
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>(
    persisted?.selectedFilterTags ?? [],
  );
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [configuringProjectId, setConfiguringProjectId] = useState<string | null>(null);
  const [browsedPath, setBrowsedPath] = useState<string | null>(null);

  // Persist UI state across tab switches
  useEffect(() => {
    setPersistedState<PersistedState>({ viewMode, searchQuery, collapsedGroups, selectedFilterTags });
  }, [viewMode, searchQuery, collapsedGroups, selectedFilterTags]);

  // If remote tab is active but no SSH hosts exist, fall back to groups
  useEffect(() => {
    if (viewMode === 'remote' && sshHosts.length === 0) {
      setViewMode('groups');
    }
  }, [viewMode, sshHosts]);

  // Listen for messages from extension host
  useEffect(() => {
    let gotInit = false;

    const dispose = onMessage((msg: HostToWebviewMessage) => {
      switch (msg.type) {
        case 'state:init':
          gotInit = true;
          setInitialized(true);
          setProjects(msg.projects);
          setTags(msg.tags);
          setConfig(msg.config);
          setCurrentProjectPath(msg.currentProjectPath);
          setActiveProjectPaths(msg.activeProjectPaths);
          setSshHosts(msg.sshHosts);
          setRemotePaths(msg.remotePaths);
          break;
        case 'state:projects':
          setProjects(msg.projects);
          setCurrentProjectPath(msg.currentProjectPath);
          break;
        case 'state:tags':
          setTags(msg.tags);
          break;
        case 'state:config':
          setConfig(msg.config);
          break;
        case 'state:activeProjects':
          setActiveProjectPaths(msg.activeProjectPaths);
          break;
        case 'state:sshHosts':
          setSshHosts(msg.hosts);
          break;
        case 'state:remotePaths':
          setRemotePaths(msg.remotePaths);
          break;
        case 'state:browsedPath':
          setBrowsedPath(msg.path);
          break;
        case 'action:showAddPanel':
          setShowAddPanel(true);
          break;
      }
    });

    // Signal readiness to extension host, retry if no response
    postMessage({ type: 'action:ready' });
    const retryTimer = setInterval(() => {
      if (!gotInit) {
        postMessage({ type: 'action:ready' });
      }
    }, 1000);

    return () => {
      clearInterval(retryTimer);
      dispose();
    };
  }, []);

  // Collect all group paths for collapse/expand all
  const allGroupPaths = useMemo(() => {
    const paths = new Set<string>();
    if (projects.some((p) => p.isFavorite)) {
      paths.add('__favorites__');
    }
    for (const p of projects) {
      if (p.group) {
        const segments = p.group.split('/').filter(Boolean);
        let current = '';
        for (const seg of segments) {
          current = current ? `${current}/${seg}` : seg;
          paths.add(current);
        }
      }
    }
    return Array.from(paths);
  }, [projects]);

  const toggleGroup = useCallback((groupName: string, recursive?: boolean) => {
    setCollapsedGroups((prev) => {
      const isCollapsed = prev.includes(groupName);
      if (recursive) {
        const related = allGroupPaths.filter(
          (p) => p === groupName || p.startsWith(groupName + '/'),
        );
        if (isCollapsed) {
          return prev.filter((g) => !related.includes(g));
        } else {
          return [...new Set([...prev, ...related])];
        }
      }
      return isCollapsed ? prev.filter((g) => g !== groupName) : [...prev, groupName];
    });
  }, [allGroupPaths]);

  const allCollapsed = allGroupPaths.length > 0 && allGroupPaths.every((p) => collapsedGroups.includes(p));

  const toggleAllGroups = useCallback(() => {
    if (allCollapsed) {
      setCollapsedGroups([]);
    } else {
      setCollapsedGroups(allGroupPaths);
    }
  }, [allCollapsed, allGroupPaths]);

  const handleConfigure = useCallback((projectId: string) => {
    setConfiguringProjectId(projectId);
  }, []);

  const handleCloseConfig = useCallback(() => {
    setConfiguringProjectId(null);
  }, []);

  const handleCloseAddPanel = useCallback(() => {
    setShowAddPanel(false);
    setBrowsedPath(null);
  }, []);

  // Build hostname/IP → alias list lookup from SSH config
  const remoteAliasMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const h of sshHosts) {
      const key = h.hostname ?? h.host;
      if (!map[key]) map[key] = [];
      if (key !== h.host) map[key].push(h.host);
    }
    return map;
  }, [sshHosts]);

  const hasProjects = projects.length > 0;
  const configuringProject = configuringProjectId
    ? projects.find((p) => p.id === configuringProjectId) ?? null
    : null;

  // Show config panel if a project is being configured
  if (configuringProject) {
    return (
      <div className="app">
        <ProjectConfigPanel
          project={configuringProject}
          tags={tags}
          projects={projects}
          onClose={handleCloseConfig}
        />
      </div>
    );
  }

  // Show add project panel
  if (showAddPanel) {
    return (
      <div className="app">
        <AddProjectPanel
          sshHosts={sshHosts}
          browsedPath={browsedPath}
          projects={projects}
          onClose={handleCloseAddPanel}
        />
      </div>
    );
  }

  // Don't show empty state until we've received init from the extension host
  if (!initialized) {
    return <div className="app" />;
  }

  return (
    <div className="app">
      {hasProjects || viewMode === 'tags' || viewMode === 'remote' ? (
        <>
          <Toolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            config={config}
            onAddProject={() => setShowAddPanel(true)}
            allCollapsed={allCollapsed}
            onToggleAllGroups={allGroupPaths.length > 0 ? toggleAllGroups : undefined}
            showRemoteTab={sshHosts.length > 0}
          />
          <div className="app-content">
            {viewMode === 'groups' && (
              <ProjectList
                projects={projects}
                tags={tags}
                config={config}
                currentProjectPath={currentProjectPath}
                activeProjectPaths={activeProjectPaths}
                searchQuery={searchQuery}
                collapsedGroups={collapsedGroups}
                onToggleGroup={toggleGroup}
                onConfigure={handleConfigure}
                remoteAliasMap={remoteAliasMap}
              />
            )}
            {viewMode === 'tags' && (
              <TagFilterView
                projects={projects}
                tags={tags}
                config={config}
                currentProjectPath={currentProjectPath}
                activeProjectPaths={activeProjectPaths}
                selectedTags={selectedFilterTags}
                onSelectedTagsChange={setSelectedFilterTags}
                searchQuery={searchQuery}
                onConfigure={handleConfigure}
                remoteAliasMap={remoteAliasMap}
              />
            )}
            {viewMode === 'remote' && (
              <RemoteView sshHosts={sshHosts} remotePaths={remotePaths} />
            )}
          </div>
        </>
      ) : (
        <EmptyState onAddProject={() => setShowAddPanel(true)} />
      )}
    </div>
  );
}
