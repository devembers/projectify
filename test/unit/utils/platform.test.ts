import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockHomedir = vi.fn(() => '/home/testuser');
const mockPlatform = vi.fn(() => 'linux' as NodeJS.Platform);
const mockStatSync = vi.fn();

vi.mock('os', () => ({
  homedir: () => mockHomedir(),
  platform: () => mockPlatform(),
}));

vi.mock('fs', () => ({
  statSync: (...args: unknown[]) => mockStatSync(...args),
}));

import { getDefaultScanPaths } from '../../../src/utils/platform.js';

describe('getDefaultScanPaths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHomedir.mockReturnValue('/home/testuser');
  });

  it('returns only directories that exist on linux', () => {
    mockPlatform.mockReturnValue('linux');
    mockStatSync.mockImplementation((p: string) => {
      if (p === '/home/testuser/projects' || p === '/home/testuser/code') {
        return { isDirectory: () => true };
      }
      throw new Error('ENOENT');
    });

    const paths = getDefaultScanPaths();
    expect(paths).toContain('/home/testuser/projects');
    expect(paths).toContain('/home/testuser/code');
    expect(paths).toHaveLength(2);
  });

  it('returns empty array when no candidate dirs exist', () => {
    mockPlatform.mockReturnValue('linux');
    mockStatSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    expect(getDefaultScanPaths()).toEqual([]);
  });

  it('uses darwin-specific candidates on macOS', () => {
    mockPlatform.mockReturnValue('darwin');
    mockStatSync.mockImplementation((p: string) => {
      if (p === '/home/testuser/Developer') {
        return { isDirectory: () => true };
      }
      throw new Error('ENOENT');
    });

    const paths = getDefaultScanPaths();
    expect(paths).toEqual(['/home/testuser/Developer']);
  });

  it('uses win32-specific candidates on Windows', () => {
    mockPlatform.mockReturnValue('win32');
    mockHomedir.mockReturnValue('C:\\Users\\testuser');
    mockStatSync.mockImplementation((p: string) => {
      if (p.endsWith('source')) {
        return { isDirectory: () => true };
      }
      throw new Error('ENOENT');
    });

    const paths = getDefaultScanPaths();
    expect(paths).toHaveLength(1);
    expect(paths[0]).toContain('source');
  });

  it('excludes paths that are not directories', () => {
    mockPlatform.mockReturnValue('linux');
    mockStatSync.mockImplementation(() => ({
      isDirectory: () => false,
    }));

    expect(getDefaultScanPaths()).toEqual([]);
  });

  it('handles statSync throwing for missing paths', () => {
    mockPlatform.mockReturnValue('linux');
    mockStatSync.mockImplementation(() => {
      const err = new Error('ENOENT') as NodeJS.ErrnoException;
      err.code = 'ENOENT';
      throw err;
    });

    expect(getDefaultScanPaths()).toEqual([]);
  });
});
