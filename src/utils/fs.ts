import * as path from 'path';
import * as os from 'os';

export function normalizePath(p: string): string {
  return path.normalize(p).replace(/\\/g, '/');
}

export function expandHome(p: string): string {
  if (p.startsWith('~')) {
    return path.join(os.homedir(), p.slice(1));
  }
  return p;
}

export function shortenPath(p: string): string {
  const home = os.homedir();
  if (p.startsWith(home)) {
    return '~' + p.slice(home.length);
  }
  return p;
}

export function getFolderName(p: string): string {
  const name = path.basename(p);
  return prettifyName(name);
}

/**
 * Turns a folder name into a human-friendly title.
 * - Splits on hyphens, underscores, dots, and camelCase boundaries
 * - Capitalizes each word
 * - e.g. "my-cool-project" → "My Cool Project"
 *        "facebook" → "Facebook"
 *        "next.js" → "Next Js"
 *        "myApp" → "My App"
 */
export function prettifyName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')   // camelCase → separate words
    .replace(/[-_.]+/g, ' ')                 // delimiters → spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize each word
    .trim();
}
