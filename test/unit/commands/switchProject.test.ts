import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sortForQuickPick, formatRelativeTime } from '../../../src/commands/switchProject.js';
import { createProject, resetFactory } from '../helpers/projectFactory.js';

// Mock vscode since switchProject.ts imports it at module level
vi.mock('vscode', () => ({
  ThemeIcon: class ThemeIcon {
    constructor(public id: string) {}
  },
  window: {
    createQuickPick: vi.fn(),
  },
}));

// Mock openProject since switchProject.ts imports it
vi.mock('../../../src/commands/openProject.js', () => ({
  openProject: vi.fn(),
  openProjectInNewWindow: vi.fn(),
}));

// Mock logger
vi.mock('../../../src/utils/logger.js', () => ({
  log: vi.fn(),
  logError: vi.fn(),
}));

// Mock fs utils
vi.mock('../../../src/utils/fs.js', () => ({
  shortenPath: vi.fn((p: string) => p),
}));

describe('sortForQuickPick', () => {
  beforeEach(() => {
    resetFactory();
  });

  it('returns empty array for empty input', () => {
    expect(sortForQuickPick([])).toEqual([]);
  });

  it('puts favorites first', () => {
    const fav = createProject({ name: 'fav', isFavorite: true });
    const normal = createProject({ name: 'normal', isFavorite: false });
    const result = sortForQuickPick([normal, fav]);
    expect(result[0].name).toBe('fav');
    expect(result[1].name).toBe('normal');
  });

  it('sorts by recency within non-favorites', () => {
    const older = createProject({ name: 'older', lastOpenedAt: 1000 });
    const newer = createProject({ name: 'newer', lastOpenedAt: 2000 });
    const result = sortForQuickPick([older, newer]);
    expect(result[0].name).toBe('newer');
    expect(result[1].name).toBe('older');
  });

  it('sorts by recency within favorites', () => {
    const favOlder = createProject({ name: 'favOlder', isFavorite: true, lastOpenedAt: 1000 });
    const favNewer = createProject({ name: 'favNewer', isFavorite: true, lastOpenedAt: 2000 });
    const result = sortForQuickPick([favOlder, favNewer]);
    expect(result[0].name).toBe('favNewer');
    expect(result[1].name).toBe('favOlder');
  });

  it('treats null lastOpenedAt as 0', () => {
    const withTime = createProject({ name: 'withTime', lastOpenedAt: 1000 });
    const noTime = createProject({ name: 'noTime', lastOpenedAt: null });
    const result = sortForQuickPick([noTime, withTime]);
    expect(result[0].name).toBe('withTime');
    expect(result[1].name).toBe('noTime');
  });

  it('does not mutate the original array', () => {
    const projects = [
      createProject({ name: 'b', lastOpenedAt: 1000 }),
      createProject({ name: 'a', lastOpenedAt: 2000 }),
    ];
    const originalFirst = projects[0];
    sortForQuickPick(projects);
    expect(projects[0]).toBe(originalFirst);
  });

  it('handles single project', () => {
    const project = createProject({ name: 'solo' });
    const result = sortForQuickPick([project]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('solo');
  });

  it('favorites before recency-sorted non-favorites', () => {
    const favOld = createProject({ name: 'favOld', isFavorite: true, lastOpenedAt: 100 });
    const recentNonFav = createProject({ name: 'recentNonFav', isFavorite: false, lastOpenedAt: 9999 });
    const result = sortForQuickPick([recentNonFav, favOld]);
    expect(result[0].name).toBe('favOld');
    expect(result[1].name).toBe('recentNonFav');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const now = new Date('2025-01-15T12:00:00Z').getTime();

  it('returns "just now" for less than 1 minute ago', () => {
    expect(formatRelativeTime(now - 30_000)).toBe('just now');
  });

  it('returns "just now" for 0ms ago', () => {
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('returns minutes for 1-59 minutes', () => {
    expect(formatRelativeTime(now - 60_000)).toBe('1 min ago');
    expect(formatRelativeTime(now - 30 * 60_000)).toBe('30 min ago');
    expect(formatRelativeTime(now - 59 * 60_000)).toBe('59 min ago');
  });

  it('returns hours for 1-23 hours', () => {
    expect(formatRelativeTime(now - 60 * 60_000)).toBe('1 hr ago');
    expect(formatRelativeTime(now - 12 * 60 * 60_000)).toBe('12 hr ago');
    expect(formatRelativeTime(now - 23 * 60 * 60_000)).toBe('23 hr ago');
  });

  it('returns days for 24+ hours', () => {
    expect(formatRelativeTime(now - 24 * 60 * 60_000)).toBe('1 day ago');
  });

  it('pluralizes days correctly', () => {
    expect(formatRelativeTime(now - 24 * 60 * 60_000)).toBe('1 day ago');
    expect(formatRelativeTime(now - 2 * 24 * 60 * 60_000)).toBe('2 days ago');
    expect(formatRelativeTime(now - 30 * 24 * 60 * 60_000)).toBe('30 days ago');
  });

  it('handles large time differences', () => {
    expect(formatRelativeTime(now - 365 * 24 * 60 * 60_000)).toBe('365 days ago');
  });

  it('handles exact boundary between minutes and hours', () => {
    // 60 minutes = 1 hour
    expect(formatRelativeTime(now - 60 * 60_000)).toBe('1 hr ago');
  });

  it('handles exact boundary between hours and days', () => {
    // 24 hours = 1 day
    expect(formatRelativeTime(now - 24 * 60 * 60_000)).toBe('1 day ago');
  });
});
