import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createElement } from 'react';

// ── Theme types ──

export type ThemeKind = 'dark' | 'light' | 'high-contrast' | 'high-contrast-light';

// ── Theme detection ──

export function getThemeKind(): ThemeKind {
  const body = document.body;
  if (body.classList.contains('vscode-high-contrast-light')) return 'high-contrast-light';
  if (body.classList.contains('vscode-high-contrast')) return 'high-contrast';
  if (body.classList.contains('vscode-light')) return 'light';
  return 'dark';
}

/** Reactive hook that tracks VS Code theme changes via MutationObserver on body class. */
export function useThemeKind(): ThemeKind {
  const [kind, setKind] = useState(getThemeKind);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setKind(getThemeKind());
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return kind;
}

// ── React context ──

const ThemeContext = createContext<ThemeKind>('dark');

export function ThemeProvider({ children }: { children: ReactNode }) {
  const kind = useThemeKind();
  return createElement(ThemeContext.Provider, { value: kind }, children);
}

export function useTheme(): ThemeKind {
  return useContext(ThemeContext);
}

// ── Color utilities ──

/** Returns true if the hex color is perceptually light (good for dark text on top). */
export function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

/** Darkens a hex color by the given fraction (0..1). */
export function darkenHex(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  const r = Math.round(parseInt(c.substring(0, 2), 16) * (1 - amount));
  const g = Math.round(parseInt(c.substring(2, 4), 16) * (1 - amount));
  const b = Math.round(parseInt(c.substring(4, 6), 16) * (1 - amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ── Tag badge styles ──

export function getTagBadgeStyle(
  color: string,
  themeKind: ThemeKind,
): { backgroundColor: string; color: string; border: string } {
  switch (themeKind) {
    case 'high-contrast':
    case 'high-contrast-light':
      return {
        backgroundColor: 'transparent',
        color,
        border: `1px solid ${color}`,
      };
    case 'light':
      return {
        backgroundColor: `${color}18`,
        color: darkenHex(color, 0.3),
        border: `1px solid ${color}33`,
      };
    default: // dark
      return {
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      };
  }
}

// ── Theme-adaptive color palettes ──

const DARK_DEFAULT_COLORS = [
  '#4fc1ff', '#4ec9b0', '#ce9178', '#c586c0',
  '#dcdcaa', '#d7ba7d', '#9cdcfe', '#569cd6',
];

const LIGHT_DEFAULT_COLORS = [
  '#0070c1', '#16825d', '#a44a00', '#9b2393',
  '#795e26', '#b05a08', '#0451a5', '#0000ff',
];

export function getDefaultColors(themeKind: ThemeKind): string[] {
  return themeKind === 'light' || themeKind === 'high-contrast-light'
    ? LIGHT_DEFAULT_COLORS
    : DARK_DEFAULT_COLORS;
}

const DARK_TAG_PALETTE = [
  '#4fc1ff', '#4ec9b0', '#ce9178', '#c586c0',
  '#dcdcaa', '#d7ba7d', '#9cdcfe', '#569cd6',
  '#f44747', '#6a9955', '#b5cea8', '#e06c75',
  '#d19a66', '#98c379', '#61afef', '#c678dd',
];

const LIGHT_TAG_PALETTE = [
  '#0070c1', '#16825d', '#a44a00', '#9b2393',
  '#795e26', '#b05a08', '#0451a5', '#0000ff',
  '#cd3131', '#008000', '#4b7e36', '#c72e4f',
  '#c06020', '#3e7a38', '#2271b1', '#7c3aed',
];

export function getTagPalette(themeKind: ThemeKind): string[] {
  return themeKind === 'light' || themeKind === 'high-contrast-light'
    ? LIGHT_TAG_PALETTE
    : DARK_TAG_PALETTE;
}
