import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { log, logError } from '../utils/logger.js';

interface WindowEntry {
  projectPath: string;
  timestamp: number;
}

interface ActiveWindowsData {
  windows: Record<string, WindowEntry>;
}

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

export class WindowTracker implements vscode.Disposable {
  private filePath: string;
  private watcher?: vscode.FileSystemWatcher;
  private windowId: string;
  private disposables: vscode.Disposable[] = [];

  private readonly _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChange = this._onDidChange.event;

  constructor(globalStorageUri: vscode.Uri) {
    this.filePath = path.join(globalStorageUri.fsPath, 'active-windows.json');
    this.windowId = vscode.env.sessionId;
  }

  async register(projectPath: string | null): Promise<void> {
    if (!projectPath) {
      return;
    }
    try {
      const data = await this.readFile();
      data.windows[this.windowId] = {
        projectPath,
        timestamp: Date.now(),
      };
      await this.writeFile(data);
      log(`WindowTracker: registered ${projectPath}`);
    } catch (err) {
      logError('WindowTracker: register failed', err);
    }
  }

  async unregister(): Promise<void> {
    try {
      const data = await this.readFile();
      delete data.windows[this.windowId];
      await this.writeFile(data);
      log('WindowTracker: unregistered');
    } catch (err) {
      logError('WindowTracker: unregister failed', err);
    }
  }

  async getActiveProjectPaths(): Promise<string[]> {
    try {
      const data = await this.readFile();
      const now = Date.now();
      const paths: string[] = [];
      let cleaned = false;

      for (const [id, entry] of Object.entries(data.windows)) {
        if (now - entry.timestamp > STALE_THRESHOLD_MS) {
          delete data.windows[id];
          cleaned = true;
          continue;
        }
        paths.push(entry.projectPath);
      }

      if (cleaned) {
        await this.writeFile(data);
      }

      return paths;
    } catch {
      return [];
    }
  }

  startWatching(): void {
    // Watch the directory containing the file for changes
    const dir = path.dirname(this.filePath);
    const filename = path.basename(this.filePath);
    this.watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(vscode.Uri.file(dir), filename),
    );
    this.disposables.push(
      this.watcher.onDidChange(() => this._onDidChange.fire()),
      this.watcher.onDidCreate(() => this._onDidChange.fire()),
      this.watcher,
    );
  }

  private async readFile(): Promise<ActiveWindowsData> {
    try {
      const content = await fs.promises.readFile(this.filePath, 'utf-8');
      return JSON.parse(content) as ActiveWindowsData;
    } catch {
      return { windows: {} };
    }
  }

  private async writeFile(data: ActiveWindowsData): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  dispose(): void {
    for (const d of this.disposables) {
      d.dispose();
    }
    this._onDidChange.dispose();
  }
}
