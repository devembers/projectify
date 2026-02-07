import { StorageData } from '../types.js';

export function createEmptyStorage(): StorageData {
  return { version: 1, projects: [], tags: [], remote: {} };
}

export function parseStorage(data: unknown): StorageData {
  if (!data || typeof data !== 'object') {
    return createEmptyStorage();
  }
  const obj = data as Record<string, unknown>;
  const remote =
    obj.remote && typeof obj.remote === 'object' && !Array.isArray(obj.remote)
      ? (obj.remote as Record<string, string>)
      : {};
  return {
    version: 1,
    projects: Array.isArray(obj.projects) ? obj.projects : [],
    tags: Array.isArray(obj.tags) ? obj.tags : [],
    remote,
  };
}
