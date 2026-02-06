import { describe, it, expect } from 'vitest';
import { createEmptyStorage, parseStorage } from '../../../src/storage/StorageSchema.js';

describe('StorageSchema', () => {
  describe('createEmptyStorage', () => {
    it('returns version 1', () => {
      expect(createEmptyStorage().version).toBe(1);
    });

    it('returns empty projects array', () => {
      expect(createEmptyStorage().projects).toEqual([]);
    });

    it('returns empty tags array', () => {
      expect(createEmptyStorage().tags).toEqual([]);
    });

    it('returns a new object each call', () => {
      const a = createEmptyStorage();
      const b = createEmptyStorage();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('parseStorage', () => {
    it('returns empty storage for null', () => {
      expect(parseStorage(null)).toEqual(createEmptyStorage());
    });

    it('returns empty storage for undefined', () => {
      expect(parseStorage(undefined)).toEqual(createEmptyStorage());
    });

    it('returns empty storage for non-object', () => {
      expect(parseStorage('string')).toEqual(createEmptyStorage());
      expect(parseStorage(42)).toEqual(createEmptyStorage());
      expect(parseStorage(true)).toEqual(createEmptyStorage());
    });

    it('returns empty arrays when projects/tags are missing', () => {
      const result = parseStorage({});
      expect(result.projects).toEqual([]);
      expect(result.tags).toEqual([]);
    });

    it('returns empty arrays when projects/tags are not arrays', () => {
      const result = parseStorage({ projects: 'bad', tags: 123 });
      expect(result.projects).toEqual([]);
      expect(result.tags).toEqual([]);
    });

    it('preserves valid projects array', () => {
      const projects = [{ id: '1', name: 'test' }];
      const result = parseStorage({ projects });
      expect(result.projects).toEqual(projects);
    });

    it('preserves valid tags array', () => {
      const tags = [{ name: 'tag1', color: '#ff0000' }];
      const result = parseStorage({ tags });
      expect(result.tags).toEqual(tags);
    });

    it('always sets version to 1', () => {
      const result = parseStorage({ version: 99, projects: [], tags: [] });
      expect(result.version).toBe(1);
    });

    it('handles object with extra keys gracefully', () => {
      const result = parseStorage({ projects: [], tags: [], extra: 'data' });
      expect(result.version).toBe(1);
      expect(result.projects).toEqual([]);
      expect(result.tags).toEqual([]);
    });
  });
});
