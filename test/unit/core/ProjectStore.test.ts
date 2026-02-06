import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('vscode', () => import('../__mocks__/vscode.js'));

vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'test-uuid'),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  log: vi.fn(),
  logError: vi.fn(),
}));

vi.mock('../../../src/utils/fs.js', () => ({
  getFolderName: vi.fn((p: string) => p.split('/').pop() ?? p),
}));

import { ProjectStore } from '../../../src/core/ProjectStore.js';
import type { StorageData, Project } from '../../../src/types.js';

function createMockStorage(initialData?: Partial<StorageData>) {
  const data: StorageData = {
    version: 1,
    projects: [],
    tags: [],
    ...initialData,
  };

  return {
    load: vi.fn(async () => data),
    save: vi.fn(async () => {}),
    getFilePath: vi.fn(() => '/fake/path/projects.json'),
    getData: vi.fn(() => data),
  };
}

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    name: 'project-1',
    rootPath: '/home/user/project-1',
    tags: [],
    isFavorite: false,
    lastOpenedAt: null,
    addedAt: 1000,
    isAvailable: true,
    ...overrides,
  };
}

describe('ProjectStore', () => {
  let store: ProjectStore;
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage = createMockStorage();
    store = new ProjectStore(mockStorage as any);
  });

  describe('getStorageFilePath', () => {
    it('delegates to storage.getFilePath()', () => {
      expect(store.getStorageFilePath()).toBe('/fake/path/projects.json');
    });
  });

  describe('load', () => {
    it('loads projects from storage', async () => {
      const project = makeProject();
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);

      await store.load();
      expect(store.getAllProjects()).toHaveLength(1);
      expect(store.getAllProjects()[0].name).toBe('project-1');
    });

    it('loads tags from storage', async () => {
      mockStorage = createMockStorage({ tags: [{ name: 'work' }] });
      store = new ProjectStore(mockStorage as any);

      await store.load();
      expect(store.getTags()).toEqual([{ name: 'work' }]);
    });

    it('clears existing projects before loading', async () => {
      const p1 = makeProject({ id: 'p1' });
      const p2 = makeProject({ id: 'p2', name: 'project-2' });

      mockStorage = createMockStorage({ projects: [p1] });
      store = new ProjectStore(mockStorage as any);
      await store.load();
      expect(store.getAllProjects()).toHaveLength(1);

      // Reload with different data
      mockStorage.load.mockResolvedValue({ version: 1, projects: [p2], tags: [] });
      await store.load();
      expect(store.getAllProjects()).toHaveLength(1);
      expect(store.getAllProjects()[0].id).toBe('p2');
    });

    it('fires onDidChange event', async () => {
      const listener = vi.fn();
      store.onDidChange(listener);
      await store.load();
      expect(listener).toHaveBeenCalled();
    });

    it('fires onDidChangeTags event', async () => {
      const listener = vi.fn();
      store.onDidChangeTags(listener);
      await store.load();
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('getAllProjects', () => {
    it('returns empty array when no projects', () => {
      expect(store.getAllProjects()).toEqual([]);
    });
  });

  describe('getProject', () => {
    it('returns a project by id', async () => {
      const project = makeProject();
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();

      expect(store.getProject('p1')).toBeDefined();
      expect(store.getProject('p1')!.name).toBe('project-1');
    });

    it('returns undefined for non-existent id', () => {
      expect(store.getProject('nonexistent')).toBeUndefined();
    });
  });

  describe('getProjectByPath', () => {
    it('finds project by rootPath', async () => {
      const project = makeProject();
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();

      expect(store.getProjectByPath('/home/user/project-1')).toBeDefined();
    });

    it('returns undefined for non-existent path', async () => {
      await store.load();
      expect(store.getProjectByPath('/nonexistent')).toBeUndefined();
    });

    it('normalizes backslashes for comparison', async () => {
      const project = makeProject({ rootPath: '/home/user/project-1' });
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();

      expect(store.getProjectByPath('\\home\\user\\project-1')).toBeDefined();
    });
  });

  describe('addProject', () => {
    it('adds a new project', async () => {
      await store.load();
      const project = await store.addProject('/home/user/new-project');
      expect(project.name).toBe('new-project');
      expect(project.id).toBe('test-uuid');
      expect(project.rootPath).toBe('/home/user/new-project');
      expect(project.isFavorite).toBe(false);
      expect(project.tags).toEqual([]);
    });

    it('returns existing project if path already exists', async () => {
      const existing = makeProject();
      mockStorage = createMockStorage({ projects: [existing] });
      store = new ProjectStore(mockStorage as any);
      await store.load();

      const result = await store.addProject('/home/user/project-1');
      expect(result.id).toBe('p1');
    });

    it('persists after adding', async () => {
      await store.load();
      await store.addProject('/home/user/new-project');
      expect(mockStorage.save).toHaveBeenCalled();
    });

    it('fires onDidChange event', async () => {
      await store.load();
      const listener = vi.fn();
      store.onDidChange(listener);
      await store.addProject('/home/user/new-project');
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('removeProject', () => {
    it('removes an existing project', async () => {
      const project = makeProject();
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();

      const removed = await store.removeProject('p1');
      expect(removed).toBe(true);
      expect(store.getAllProjects()).toHaveLength(0);
    });

    it('returns false for non-existent project', async () => {
      await store.load();
      const removed = await store.removeProject('nonexistent');
      expect(removed).toBe(false);
    });

    it('persists after removing', async () => {
      const project = makeProject();
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();
      mockStorage.save.mockClear();

      await store.removeProject('p1');
      expect(mockStorage.save).toHaveBeenCalled();
    });
  });

  describe('updateProject', () => {
    it('updates project fields', async () => {
      const project = makeProject();
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();

      const updated = await store.updateProject('p1', { name: 'renamed' });
      expect(updated?.name).toBe('renamed');
    });

    it('returns undefined for non-existent project', async () => {
      await store.load();
      const result = await store.updateProject('nonexistent', { name: 'x' });
      expect(result).toBeUndefined();
    });

    it('persists after updating', async () => {
      const project = makeProject();
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();
      mockStorage.save.mockClear();

      await store.updateProject('p1', { name: 'renamed' });
      expect(mockStorage.save).toHaveBeenCalled();
    });
  });

  describe('markOpened', () => {
    it('sets lastOpenedAt on matching project', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-06-01T00:00:00Z'));

      const project = makeProject();
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();

      await store.markOpened('/home/user/project-1');
      const updated = store.getProject('p1');
      expect(updated?.lastOpenedAt).toBe(Date.now());

      vi.useRealTimers();
    });

    it('does nothing for non-existent path', async () => {
      await store.load();
      mockStorage.save.mockClear();
      await store.markOpened('/nonexistent');
      expect(mockStorage.save).not.toHaveBeenCalled();
    });
  });

  describe('toggleFavorite', () => {
    it('toggles favorite to true', async () => {
      const project = makeProject({ isFavorite: false });
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();

      const result = await store.toggleFavorite('p1');
      expect(result).toBe(true);
    });

    it('toggles favorite to false', async () => {
      const project = makeProject({ isFavorite: true });
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();

      const result = await store.toggleFavorite('p1');
      expect(result).toBe(false);
    });

    it('returns undefined for non-existent project', async () => {
      await store.load();
      const result = await store.toggleFavorite('nonexistent');
      expect(result).toBeUndefined();
    });

    it('persists after toggling', async () => {
      const project = makeProject();
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();
      mockStorage.save.mockClear();

      await store.toggleFavorite('p1');
      expect(mockStorage.save).toHaveBeenCalled();
    });
  });

  describe('setProjectTags', () => {
    it('sets tags on a project', async () => {
      const project = makeProject();
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();

      await store.setProjectTags('p1', ['work', 'important']);
      expect(store.getProject('p1')?.tags).toEqual(['work', 'important']);
    });

    it('does nothing for non-existent project', async () => {
      await store.load();
      mockStorage.save.mockClear();
      await store.setProjectTags('nonexistent', ['tag']);
      expect(mockStorage.save).not.toHaveBeenCalled();
    });
  });

  describe('tag management', () => {
    describe('getTags', () => {
      it('returns tags sorted alphabetically', async () => {
        mockStorage = createMockStorage({ tags: [{ name: 'work' }, { name: 'admin' }] });
        store = new ProjectStore(mockStorage as any);
        await store.load();

        const tags = store.getTags();
        expect(tags[0].name).toBe('admin');
        expect(tags[1].name).toBe('work');
      });

      it('returns empty array when no tags', () => {
        expect(store.getTags()).toEqual([]);
      });
    });

    describe('addTag', () => {
      it('adds a new tag', async () => {
        await store.load();
        const tag = await store.addTag('newtag', '#ff0000');
        expect(tag.name).toBe('newtag');
        expect(tag.color).toBe('#ff0000');
      });

      it('returns existing tag if name already exists', async () => {
        mockStorage = createMockStorage({ tags: [{ name: 'existing', color: '#000' }] });
        store = new ProjectStore(mockStorage as any);
        await store.load();

        const tag = await store.addTag('existing', '#fff');
        expect(tag.color).toBe('#000');
      });

      it('fires onDidChangeTags event', async () => {
        await store.load();
        const listener = vi.fn();
        store.onDidChangeTags(listener);
        await store.addTag('newtag');
        expect(listener).toHaveBeenCalled();
      });
    });

    describe('removeTag', () => {
      it('removes a tag', async () => {
        mockStorage = createMockStorage({ tags: [{ name: 'removeme' }] });
        store = new ProjectStore(mockStorage as any);
        await store.load();

        await store.removeTag('removeme');
        expect(store.getTags()).toEqual([]);
      });

      it('removes tag from all projects', async () => {
        const project = makeProject({ tags: ['keep', 'removeme'] });
        mockStorage = createMockStorage({
          projects: [project],
          tags: [{ name: 'keep' }, { name: 'removeme' }],
        });
        store = new ProjectStore(mockStorage as any);
        await store.load();

        await store.removeTag('removeme');
        expect(store.getProject('p1')?.tags).toEqual(['keep']);
      });
    });

    describe('updateTagColor', () => {
      it('updates the color of an existing tag', async () => {
        mockStorage = createMockStorage({ tags: [{ name: 'tag1', color: '#000' }] });
        store = new ProjectStore(mockStorage as any);
        await store.load();

        await store.updateTagColor('tag1', '#fff');
        const tags = store.getTags();
        expect(tags[0].color).toBe('#fff');
      });

      it('does nothing for non-existent tag', async () => {
        await store.load();
        mockStorage.save.mockClear();
        await store.updateTagColor('nonexistent', '#fff');
        expect(mockStorage.save).not.toHaveBeenCalled();
      });
    });

    describe('renameTag', () => {
      it('renames a tag', async () => {
        mockStorage = createMockStorage({ tags: [{ name: 'oldname' }] });
        store = new ProjectStore(mockStorage as any);
        await store.load();

        await store.renameTag('oldname', 'newname');
        expect(store.getTags()[0].name).toBe('newname');
      });

      it('updates tag references in all projects', async () => {
        const project = makeProject({ tags: ['oldname', 'other'] });
        mockStorage = createMockStorage({
          projects: [project],
          tags: [{ name: 'oldname' }, { name: 'other' }],
        });
        store = new ProjectStore(mockStorage as any);
        await store.load();

        await store.renameTag('oldname', 'newname');
        expect(store.getProject('p1')?.tags).toEqual(['newname', 'other']);
      });

      it('does nothing for non-existent tag', async () => {
        await store.load();
        mockStorage.save.mockClear();
        await store.renameTag('nonexistent', 'newname');
        expect(mockStorage.save).not.toHaveBeenCalled();
      });
    });
  });

  describe('setAvailability', () => {
    it('sets availability to false', async () => {
      const project = makeProject({ isAvailable: true });
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();

      await store.setAvailability('p1', false);
      expect(store.getProject('p1')?.isAvailable).toBe(false);
    });

    it('does not persist if value unchanged', async () => {
      const project = makeProject({ isAvailable: true });
      mockStorage = createMockStorage({ projects: [project] });
      store = new ProjectStore(mockStorage as any);
      await store.load();
      mockStorage.save.mockClear();

      await store.setAvailability('p1', true);
      expect(mockStorage.save).not.toHaveBeenCalled();
    });

    it('does nothing for non-existent project', async () => {
      await store.load();
      mockStorage.save.mockClear();
      await store.setAvailability('nonexistent', false);
      expect(mockStorage.save).not.toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('can be called without errors', () => {
      expect(() => store.dispose()).not.toThrow();
    });
  });
});
