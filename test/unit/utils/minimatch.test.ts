import { describe, it, expect } from 'vitest';
import { minimatch } from '../../../src/utils/minimatch.js';

describe('minimatch', () => {
  describe('exact matches', () => {
    it('matches identical strings', () => {
      expect(minimatch('node_modules', 'node_modules')).toBe(true);
    });

    it('rejects different strings', () => {
      expect(minimatch('node_modules', 'dist')).toBe(false);
    });

    it('is case-sensitive', () => {
      expect(minimatch('Node_Modules', 'node_modules')).toBe(false);
    });
  });

  describe('* wildcard', () => {
    it('matches prefix wildcard', () => {
      expect(minimatch('.gitignore', '.*')).toBe(true);
    });

    it('matches suffix wildcard', () => {
      expect(minimatch('test.ts', '*.ts')).toBe(true);
    });

    it('matches middle wildcard', () => {
      expect(minimatch('file.test.ts', 'file.*.ts')).toBe(true);
    });

    it('matches everything with lone *', () => {
      expect(minimatch('anything', '*')).toBe(true);
    });

    it('rejects non-matching wildcard', () => {
      expect(minimatch('test.js', '*.ts')).toBe(false);
    });
  });

  describe('? wildcard', () => {
    it('matches single character', () => {
      expect(minimatch('a1', 'a?')).toBe(true);
    });

    it('does not match empty character', () => {
      expect(minimatch('a', 'a?')).toBe(false);
    });

    it('does not match multiple characters', () => {
      expect(minimatch('abc', 'a?')).toBe(false);
    });
  });

  describe('special characters', () => {
    it('handles dots in pattern', () => {
      expect(minimatch('.git', '.git')).toBe(true);
    });

    it('handles dots correctly (not as regex wildcard)', () => {
      expect(minimatch('agit', '.git')).toBe(false);
    });

    it('handles regex special chars in pattern', () => {
      expect(minimatch('file(1)', 'file(1)')).toBe(true);
    });
  });
});
