import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as path from 'path';

vi.mock('vscode', () => import('../__mocks__/vscode.js'));

vi.mock('../../../src/utils/logger.js', () => ({
  log: vi.fn(),
  logError: vi.fn(),
}));

const mockReadFile = vi.fn();
const mockWriteFile = vi.fn();
const mockMkdir = vi.fn();

vi.mock('fs', () => ({
  promises: {
    readFile: (...args: unknown[]) => mockReadFile(...args),
    writeFile: (...args: unknown[]) => mockWriteFile(...args),
    mkdir: (...args: unknown[]) => mockMkdir(...args),
  },
}));

import { JsonStorage } from '../../../src/storage/JsonStorage.js';

const STORAGE_DIR = '/fake/globalStorage';
const STORAGE_FILE = path.join(STORAGE_DIR, 'projects.json');

function createStorage(): JsonStorage {
  const uri = { fsPath: STORAGE_DIR } as { fsPath: string };
  return new JsonStorage(uri as any);
}

describe('JsonStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('sets the file path correctly', () => {
      const storage = createStorage();
      expect(storage.getFilePath()).toBe(STORAGE_FILE);
    });

    it('initializes with empty storage data', () => {
      const storage = createStorage();
      const data = storage.getData();
      expect(data.version).toBe(1);
      expect(data.projects).toEqual([]);
      expect(data.tags).toEqual([]);
    });
  });

  describe('load', () => {
    it('loads and parses valid JSON from file', async () => {
      const storedData = {
        version: 1,
        projects: [{ id: '1', name: 'test' }],
        tags: [{ name: 'tag1' }],
      };
      mockReadFile.mockResolvedValue(JSON.stringify(storedData));

      const storage = createStorage();
      const data = await storage.load();
      expect(data.projects).toEqual([{ id: '1', name: 'test' }]);
      expect(data.tags).toEqual([{ name: 'tag1' }]);
    });

    it('returns empty storage when file does not exist (ENOENT)', async () => {
      const err = new Error('not found') as NodeJS.ErrnoException;
      err.code = 'ENOENT';
      mockReadFile.mockRejectedValue(err);

      const storage = createStorage();
      const data = await storage.load();
      expect(data.projects).toEqual([]);
      expect(data.tags).toEqual([]);
    });

    it('returns empty storage on other read errors', async () => {
      mockReadFile.mockRejectedValue(new Error('permission denied'));

      const storage = createStorage();
      const data = await storage.load();
      expect(data.projects).toEqual([]);
      expect(data.tags).toEqual([]);
    });

    it('returns empty storage on invalid JSON', async () => {
      mockReadFile.mockResolvedValue('not json!');

      const storage = createStorage();
      const data = await storage.load();
      expect(data.projects).toEqual([]);
      expect(data.tags).toEqual([]);
    });

    it('updates internal data after loading', async () => {
      const storedData = {
        version: 1,
        projects: [{ id: '1', name: 'test' }],
        tags: [],
      };
      mockReadFile.mockResolvedValue(JSON.stringify(storedData));

      const storage = createStorage();
      await storage.load();
      expect(storage.getData().projects).toEqual([{ id: '1', name: 'test' }]);
    });
  });

  describe('save', () => {
    it('creates directory and writes JSON', async () => {
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const storage = createStorage();
      const data = { version: 1, projects: [], tags: [] };
      await storage.save(data);

      expect(mockMkdir).toHaveBeenCalledWith(STORAGE_DIR, { recursive: true });
      expect(mockWriteFile).toHaveBeenCalledWith(
        STORAGE_FILE,
        JSON.stringify(data, null, 2),
        'utf-8',
      );
    });

    it('updates internal data after saving', async () => {
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const storage = createStorage();
      const data = { version: 1, projects: [{ id: '1', name: 'saved' }] as any[], tags: [] };
      await storage.save(data);
      expect(storage.getData().projects[0].name).toBe('saved');
    });

    it('handles write errors gracefully', async () => {
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockRejectedValue(new Error('disk full'));

      const storage = createStorage();
      // Should not throw
      await storage.save({ version: 1, projects: [], tags: [] });
    });
  });
});
