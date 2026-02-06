import type { Project, SortBy } from '../../types.js';

export function sortProjects(projects: Project[], sortBy: SortBy): Project[] {
  const sorted = [...projects];
  sorted.sort((a, b) => {
    // Favorites always first
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recency': {
        const aTime = a.lastOpenedAt ?? 0;
        const bTime = b.lastOpenedAt ?? 0;
        return bTime - aTime;
      }
      default:
        return 0;
    }
  });
  return sorted;
}

export function isCurrent(project: Project, currentPath: string | null): boolean {
  if (!currentPath) return false;
  return project.rootPath.replace(/\\/g, '/') === currentPath.replace(/\\/g, '/');
}

export function isActive(project: Project, activePaths: string[]): boolean {
  const normalized = project.rootPath.replace(/\\/g, '/');
  return activePaths.some((p) => p.replace(/\\/g, '/') === normalized);
}
