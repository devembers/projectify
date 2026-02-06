import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as path from 'path';

vi.mock('os', () => ({
  homedir: vi.fn(() => '/home/testuser'),
}));

import { normalizePath, expandHome, shortenPath, getFolderName } from '../../../src/utils/fs.js';

describe('fs utils', () => {
  describe('normalizePath', () => {
    it('normalizes forward slashes', () => {
      const result = normalizePath('/home/user/projects');
      expect(result).toBe('/home/user/projects');
    });

    it('preserves trailing slash (path.normalize behavior)', () => {
      const result = normalizePath('/home/user/projects/');
      // path.normalize preserves a single trailing slash on POSIX
      expect(result).toBe('/home/user/projects/');
    });

    it('resolves double slashes', () => {
      const result = normalizePath('/home//user//projects');
      expect(result).toBe('/home/user/projects');
    });

    it('resolves dot segments', () => {
      const result = normalizePath('/home/user/./projects');
      expect(result).toBe('/home/user/projects');
    });

    it('resolves parent segments', () => {
      const result = normalizePath('/home/user/foo/../projects');
      expect(result).toBe('/home/user/projects');
    });
  });

  describe('expandHome', () => {
    it('expands ~ to home directory', () => {
      const result = expandHome('~/projects');
      expect(result).toBe(path.join('/home/testuser', 'projects'));
    });

    it('does not modify absolute paths', () => {
      const result = expandHome('/absolute/path');
      expect(result).toBe('/absolute/path');
    });

    it('does not modify paths without leading tilde', () => {
      const result = expandHome('relative/path');
      expect(result).toBe('relative/path');
    });

    it('handles bare ~', () => {
      const result = expandHome('~');
      expect(result).toBe('/home/testuser');
    });
  });

  describe('shortenPath', () => {
    it('replaces home directory with ~', () => {
      const result = shortenPath('/home/testuser/projects');
      expect(result).toBe('~/projects');
    });

    it('does not shorten paths outside home', () => {
      const result = shortenPath('/other/path');
      expect(result).toBe('/other/path');
    });

    it('handles exact home directory path', () => {
      const result = shortenPath('/home/testuser');
      expect(result).toBe('~');
    });
  });

  describe('getFolderName', () => {
    it('returns the last segment of a path', () => {
      expect(getFolderName('/home/user/projects/myapp')).toBe('myapp');
    });

    it('works with single segment', () => {
      expect(getFolderName('myapp')).toBe('myapp');
    });
  });
});
