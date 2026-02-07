import { useMemo } from 'react';
import type { Project, Tag } from '../../types.js';
import type { WebViewConfig } from '../../shared/protocol.js';
import { ProjectCard } from './ProjectCard.js';
import { GroupHeader } from './GroupHeader.js';
import { sortProjects, isCurrent, isActive } from '../utils/projectHelpers.js';
import { postMessage } from '../vscodeApi.js';

interface ProjectListProps {
  projects: Project[];
  tags: Tag[];
  config: WebViewConfig;
  currentProjectPath: string | null;
  activeProjectPaths: string[];
  searchQuery: string;
  collapsedGroups: string[];
  onToggleGroup: (groupName: string, recursive?: boolean) => void;
  onConfigure: (projectId: string) => void;
  remoteAliasMap: Record<string, string[]>;
}

interface GroupTreeNode {
  name: string;
  path: string;
  depth: number;
  children: GroupTreeNode[];
  projects: Project[];
}

function buildGroupTree(projects: Project[]): { ungrouped: Project[]; roots: GroupTreeNode[] } {
  const ungrouped: Project[] = [];
  const nodeMap = new Map<string, GroupTreeNode>();

  for (const p of projects) {
    if (!p.group) {
      ungrouped.push(p);
      continue;
    }

    const segments = p.group.split('/').filter(Boolean);
    if (segments.length === 0) {
      ungrouped.push(p);
      continue;
    }

    // Ensure all ancestor nodes exist
    let currentPath = '';
    for (let i = 0; i < segments.length; i++) {
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${segments[i]}` : segments[i];

      if (!nodeMap.has(currentPath)) {
        const node: GroupTreeNode = {
          name: segments[i],
          path: currentPath,
          depth: i,
          children: [],
          projects: [],
        };
        nodeMap.set(currentPath, node);

        // Link to parent
        if (parentPath) {
          const parent = nodeMap.get(parentPath)!;
          parent.children.push(node);
        }
      }
    }

    // Add project to the leaf node
    const leafPath = segments.join('/');
    nodeMap.get(leafPath)!.projects.push(p);
  }

  // Collect root nodes (depth === 0), sort alphabetically
  const roots = Array.from(nodeMap.values())
    .filter((n) => n.depth === 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Sort children recursively
  function sortChildren(node: GroupTreeNode) {
    node.children.sort((a, b) => a.name.localeCompare(b.name));
    for (const child of node.children) {
      sortChildren(child);
    }
  }
  for (const root of roots) {
    sortChildren(root);
  }

  return { ungrouped, roots };
}

function countAllProjects(node: GroupTreeNode): number {
  let count = node.projects.length;
  for (const child of node.children) {
    count += countAllProjects(child);
  }
  return count;
}

export function ProjectList({
  projects,
  tags,
  config,
  currentProjectPath,
  activeProjectPaths,
  searchQuery,
  collapsedGroups,
  onToggleGroup,
  onConfigure,
  remoteAliasMap,
}: ProjectListProps) {
  // Filter by search query
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.rootPath.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [projects, searchQuery]);

  // Sort: favorites first, then by config.sortBy
  const sorted = useMemo(() => {
    return sortProjects(filtered, config.sortBy);
  }, [filtered, config.sortBy]);

  // Separate favorites
  const favorites = useMemo(() => sorted.filter((p) => p.isFavorite), [sorted]);

  // Build group tree
  const { ungrouped, roots } = useMemo(() => {
    return buildGroupTree(sorted);
  }, [sorted]);

  if (filtered.length === 0) {
    return (
      <div className="project-list--empty">
        {searchQuery ? `No projects matching "${searchQuery}"` : 'No projects found'}
      </div>
    );
  }

  function renderCard(p: Project, depth: number) {
    return (
      <div key={p.id} style={depth > 0 ? { paddingLeft: `${depth * 12}px` } : undefined}>
        <ProjectCard
          project={p}
          tags={tags}
          isCurrent={isCurrent(p, currentProjectPath)}
          isActive={isActive(p, activeProjectPaths)}
          onConfigure={onConfigure}
          remoteAliases={p.remoteHost ? remoteAliasMap[p.remoteHost] ?? [] : []}
        />
      </div>
    );
  }

  function renderGroupNode(node: GroupTreeNode) {
    const collapsed = collapsedGroups.includes(node.path);
    const totalCount = countAllProjects(node);

    return (
      <div key={node.path}>
        <div style={node.depth > 0 ? { paddingLeft: `${node.depth * 12}px` } : undefined}>
          <GroupHeader
            label={node.name}
            count={totalCount}
            collapsed={collapsed}
            onToggle={(recursive) => onToggleGroup(node.path, recursive)}
            onRename={(newName) =>
              postMessage({ type: 'action:renameGroup', oldPath: node.path, newName })
            }
          />
        </div>
        {!collapsed && (
          <>
            {node.projects.map((p) => renderCard(p, node.depth + 1))}
            {node.children.map((child) => renderGroupNode(child))}
          </>
        )}
      </div>
    );
  }

  const favoritesCollapsed = collapsedGroups.includes('__favorites__');

  return (
    <div className="project-list">
      {favorites.length > 0 && (
        <div>
          <GroupHeader
            label="Favorites"
            count={favorites.length}
            collapsed={favoritesCollapsed}
            onToggle={(recursive) => onToggleGroup('__favorites__', recursive)}
          />
          {!favoritesCollapsed && favorites.map((p) => renderCard(p, 1))}
        </div>
      )}
      {ungrouped.length > 0 && (
        <div className="project-list__ungrouped">
          {ungrouped.map((p) => renderCard(p, 0))}
        </div>
      )}
      {roots.map((root) => renderGroupNode(root))}
    </div>
  );
}
