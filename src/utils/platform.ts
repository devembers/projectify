import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

export function getDefaultScanPaths(): string[] {
  const home = os.homedir();
  const platform = os.platform();

  let candidates: string[];

  switch (platform) {
    case 'darwin':
      candidates = [
        path.join(home, 'Developer'),
        path.join(home, 'Projects'),
        path.join(home, 'code'),
        path.join(home, 'work'),
        path.join(home, 'repos'),
        path.join(home, 'src'),
        path.join(home, 'GitHub'),
      ];
      break;
    case 'win32':
      candidates = [
        path.join(home, 'Projects'),
        path.join(home, 'code'),
        path.join(home, 'source'),
        path.join(home, 'repos'),
      ];
      break;
    default:
      // Linux and other Unix
      candidates = [
        path.join(home, 'projects'),
        path.join(home, 'code'),
        path.join(home, 'work'),
        path.join(home, 'repos'),
        path.join(home, 'src'),
        path.join(home, 'dev'),
        path.join(home, 'GitHub'),
      ];
      break;
  }

  return candidates.filter((p) => {
    try {
      return fs.statSync(p).isDirectory();
    } catch {
      return false;
    }
  });
}
