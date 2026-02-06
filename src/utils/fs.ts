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
  return path.basename(p);
}
