import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { StorageData } from '../types.js';
import { STORAGE_FILE } from '../constants.js';
import { createEmptyStorage, parseStorage } from './StorageSchema.js';
import { log, logError } from '../utils/logger.js';

export class JsonStorage {
  private filePath: string;
  private data: StorageData;

  constructor(globalStorageUri: vscode.Uri) {
    this.filePath = path.join(globalStorageUri.fsPath, STORAGE_FILE);
    this.data = createEmptyStorage();
  }

  async load(): Promise<StorageData> {
    try {
      const raw = await fs.promises.readFile(this.filePath, 'utf-8');
      this.data = parseStorage(JSON.parse(raw));
      log(`Loaded ${this.data.projects.length} projects from storage`);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        log('No existing storage file, starting fresh');
        this.data = createEmptyStorage();
      } else {
        logError('Failed to load storage', err);
        this.data = createEmptyStorage();
      }
    }
    return this.data;
  }

  async save(data: StorageData): Promise<void> {
    this.data = data;
    try {
      const dir = path.dirname(this.filePath);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      logError('Failed to save storage', err);
    }
  }

  getFilePath(): string {
    return this.filePath;
  }

  getData(): StorageData {
    return this.data;
  }
}
