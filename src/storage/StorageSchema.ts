import { StorageData } from '../types.js';

export function createEmptyStorage(): StorageData {
  return { version: 1, projects: [], tags: [] };
}

export function parseStorage(data: unknown): StorageData {
  if (!data || typeof data !== 'object') {
    return createEmptyStorage();
  }
  const obj = data as Record<string, unknown>;
  return {
    version: 1,
    projects: Array.isArray(obj.projects) ? obj.projects : [],
    tags: Array.isArray(obj.tags) ? obj.tags : [],
  };
}
