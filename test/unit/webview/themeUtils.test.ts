import { describe, it, expect } from 'vitest';
import {
  isLightColor,
  darkenHex,
  getTagBadgeStyle,
  getDefaultColors,
  getTagPalette,
} from '../../../src/webview/utils/themeUtils.js';

describe('isLightColor', () => {
  it('returns true for white', () => {
    expect(isLightColor('#ffffff')).toBe(true);
  });

  it('returns false for black', () => {
    expect(isLightColor('#000000')).toBe(false);
  });

  it('returns true for bright yellow', () => {
    expect(isLightColor('#ffff00')).toBe(true);
  });

  it('returns false for dark blue', () => {
    expect(isLightColor('#00008b')).toBe(false);
  });

  it('handles without hash prefix', () => {
    expect(isLightColor('ffffff')).toBe(true);
  });
});

describe('darkenHex', () => {
  it('returns black when darkened by 100%', () => {
    expect(darkenHex('#ffffff', 1)).toBe('#000000');
  });

  it('returns same color when darkened by 0%', () => {
    expect(darkenHex('#ff8040', 0)).toBe('#ff8040');
  });

  it('darkens by 50%', () => {
    expect(darkenHex('#ff8040', 0.5)).toBe('#804020');
  });

  it('handles lowercase hex', () => {
    expect(darkenHex('#aabbcc', 0)).toBe('#aabbcc');
  });
});

describe('getTagBadgeStyle', () => {
  const color = '#4fc1ff';

  it('dark theme uses translucent bg with full-color text', () => {
    const style = getTagBadgeStyle(color, 'dark');
    expect(style.backgroundColor).toBe(`${color}22`);
    expect(style.color).toBe(color);
    expect(style.border).toBe(`1px solid ${color}44`);
  });

  it('light theme uses lighter bg with darkened text', () => {
    const style = getTagBadgeStyle(color, 'light');
    expect(style.backgroundColor).toBe(`${color}18`);
    expect(style.color).toBe(darkenHex(color, 0.3));
    expect(style.border).toBe(`1px solid ${color}33`);
  });

  it('high-contrast theme uses transparent bg with solid border', () => {
    const style = getTagBadgeStyle(color, 'high-contrast');
    expect(style.backgroundColor).toBe('transparent');
    expect(style.color).toBe(color);
    expect(style.border).toBe(`1px solid ${color}`);
  });

  it('high-contrast-light theme uses transparent bg with solid border', () => {
    const style = getTagBadgeStyle(color, 'high-contrast-light');
    expect(style.backgroundColor).toBe('transparent');
    expect(style.color).toBe(color);
    expect(style.border).toBe(`1px solid ${color}`);
  });
});

describe('getDefaultColors', () => {
  it('returns 8 colors for dark theme', () => {
    const colors = getDefaultColors('dark');
    expect(colors).toHaveLength(8);
    expect(colors[0]).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('returns 8 colors for light theme', () => {
    const colors = getDefaultColors('light');
    expect(colors).toHaveLength(8);
    expect(colors[0]).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('returns different palettes for dark vs light', () => {
    expect(getDefaultColors('dark')).not.toEqual(getDefaultColors('light'));
  });

  it('light and high-contrast-light return same palette', () => {
    expect(getDefaultColors('light')).toEqual(getDefaultColors('high-contrast-light'));
  });
});

describe('getTagPalette', () => {
  it('returns 16 colors for dark theme', () => {
    const colors = getTagPalette('dark');
    expect(colors).toHaveLength(16);
  });

  it('returns 16 colors for light theme', () => {
    const colors = getTagPalette('light');
    expect(colors).toHaveLength(16);
  });

  it('returns different palettes for dark vs light', () => {
    expect(getTagPalette('dark')).not.toEqual(getTagPalette('light'));
  });

  it('high-contrast uses dark palette', () => {
    expect(getTagPalette('high-contrast')).toEqual(getTagPalette('dark'));
  });
});
