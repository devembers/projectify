import { useMemo } from 'react';
import type { Project, Tag } from '../../types.js';
import type { WebViewConfig } from '../../shared/protocol.js';
import { ProjectCard } from './ProjectCard.js';
import { TagManager } from './TagManager.js';
import { sortProjects, isCurrent, isActive } from '../utils/projectHelpers.js';
import { isLightColor } from '../utils/themeUtils.js';

interface TagFilterViewProps {
  projects: Project[];
  tags: Tag[];
  config: WebViewConfig;
  currentProjectPath: string | null;
  activeProjectPaths: string[];
  selectedTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
  searchQuery: string;
  onConfigure: (projectId: string) => void;
  remoteAliasMap: Record<string, string[]>;
}

export function TagFilterView({
  projects,
  tags,
  config,
  currentProjectPath,
  activeProjectPaths,
  selectedTags,
  onSelectedTagsChange,
  searchQuery,
  onConfigure,
  remoteAliasMap,
}: TagFilterViewProps) {
  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onSelectedTagsChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onSelectedTagsChange([...selectedTags, tagName]);
    }
  };

  const filtered = useMemo(() => {
    let result = projects;

    // Filter by selected tags (OR logic)
    if (selectedTags.length > 0) {
      result = result.filter((p) =>
        selectedTags.some((tag) => p.tags.includes(tag)),
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.rootPath.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return sortProjects(result, config.sortBy);
  }, [projects, selectedTags, searchQuery, config.sortBy]);

  return (
    <div className="tag-filter-view">
      {tags.length > 0 && (
        <div className="filter-chips">
          {tags.map((tag) => {
            const active = selectedTags.includes(tag.name);
            return (
              <button
                key={tag.name}
                className={`filter-chip ${active ? 'filter-chip--active' : ''}`}
                onClick={() => toggleTag(tag.name)}
                style={active && tag.color ? { backgroundColor: tag.color, color: isLightColor(tag.color) ? '#1e1e1e' : '#ffffff' } : undefined}
              >
                {tag.name}
              </button>
            );
          })}
          {selectedTags.length > 0 && (
            <button
              className="filter-chip filter-chip--clear"
              onClick={() => onSelectedTagsChange([])}
            >
              <span className="codicon codicon-close" /> Clear
            </button>
          )}
        </div>
      )}

      <TagManager tags={tags} projects={projects} />

      <div className="project-list tag-filter-view__projects">
        {filtered.length === 0 ? (
          <div className="project-list--empty">
            {searchQuery || selectedTags.length > 0
              ? 'No projects match the current filters'
              : 'No projects found'}
          </div>
        ) : (
          filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              tags={tags}
              isCurrent={isCurrent(p, currentProjectPath)}
              isActive={isActive(p, activeProjectPaths)}
              onConfigure={onConfigure}
              remoteAliases={p.remoteHost ? remoteAliasMap[p.remoteHost] ?? [] : []}
            />
          ))
        )}
      </div>
    </div>
  );
}
