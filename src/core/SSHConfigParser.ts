import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as vscode from 'vscode';
import type { SSHHost } from '../types.js';
import { log, logError } from '../utils/logger.js';

export class SSHConfigParser implements vscode.Disposable {
  private watcher?: vscode.FileSystemWatcher;
  private disposables: vscode.Disposable[] = [];
  private cachedHosts: SSHHost[] | null = null;

  private readonly _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChange = this._onDidChange.event;

  private get configPath(): string {
    return path.join(os.homedir(), '.ssh', 'config');
  }

  async getHosts(): Promise<SSHHost[]> {
    if (this.cachedHosts) {
      return this.cachedHosts;
    }
    this.cachedHosts = await this.parse();
    return this.cachedHosts;
  }

  startWatching(): void {
    const sshDir = path.join(os.homedir(), '.ssh');
    this.watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(vscode.Uri.file(sshDir), 'config'),
    );
    this.disposables.push(
      this.watcher.onDidChange(() => {
        this.cachedHosts = null;
        this._onDidChange.fire();
      }),
      this.watcher.onDidCreate(() => {
        this.cachedHosts = null;
        this._onDidChange.fire();
      }),
      this.watcher,
    );
  }

  private async parse(): Promise<SSHHost[]> {
    try {
      const content = await fs.promises.readFile(this.configPath, 'utf-8');
      return parseSSHConfig(content);
    } catch (err) {
      // File might not exist
      log('SSHConfigParser: no config found or unreadable');
      return [];
    }
  }

  dispose(): void {
    for (const d of this.disposables) {
      d.dispose();
    }
    this._onDidChange.dispose();
  }
}

/**
 * Simple SSH config parser. Handles standard Host blocks.
 * Ignores wildcard patterns (*, *.domain).
 */
export function parseSSHConfig(content: string): SSHHost[] {
  const hosts: SSHHost[] = [];
  // A single Host line can list multiple aliases (e.g. "Host pn51 b backend").
  // All subsequent settings apply to each alias, so we track an array.
  let currentHosts: SSHHost[] = [];

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();

    // Skip comments and empty lines
    if (!line || line.startsWith('#')) {
      continue;
    }

    // Split on first whitespace or =
    const match = line.match(/^(\S+)\s*[=\s]\s*(.+)$/);
    if (!match) {
      continue;
    }

    const [, keyword, value] = match;
    const key = keyword.toLowerCase();

    if (key === 'host') {
      // Finalize previous hosts
      hosts.push(...currentHosts);

      // Split on whitespace — each token is a separate alias
      const patterns = value.trim().split(/\s+/);
      currentHosts = [];
      for (const pattern of patterns) {
        // Skip wildcard patterns
        if (pattern.includes('*') || pattern.includes('?')) {
          continue;
        }
        currentHosts.push({ host: pattern });
      }
    } else if (currentHosts.length > 0) {
      for (const h of currentHosts) {
        switch (key) {
          case 'hostname':
            h.hostname = value.trim();
            break;
          case 'user':
            h.user = value.trim();
            break;
          case 'port': {
            const port = parseInt(value.trim(), 10);
            if (!isNaN(port)) {
              h.port = port;
            }
            break;
          }
          case 'identityfile':
            h.identityFile = value.trim();
            break;
        }
      }
    }
  }

  // Don't forget the last hosts
  hosts.push(...currentHosts);

  return hosts;
}
