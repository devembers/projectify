import type { Project } from '../../../src/types.js';

let counter = 0;

export function createProject(overrides: Partial<Project> = {}): Project {
  counter++;
  return {
    id: `test-id-${counter}`,
    name: `project-${counter}`,
    rootPath: `/home/user/projects/project-${counter}`,
    tags: [],
    isFavorite: false,
    lastOpenedAt: null,
    addedAt: Date.now(),
    isAvailable: true,
    ...overrides,
  };
}

export function resetFactory(): void {
  counter = 0;
}
