import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { Project, Tag, StorageData } from '../types.js';
import { JsonStorage } from '../storage/JsonStorage.js';
import { log } from '../utils/logger.js';
import { getFolderName } from '../utils/fs.js';

export class ProjectStore {
  private storage: JsonStorage;
  private projects: Map<string, Project> = new Map();
  private tags: Tag[] = [];
  private remotePaths: Record<string, string> = {};

  private readonly _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChange = this._onDidChange.event;

  private readonly _onDidChangeTags = new vscode.EventEmitter<void>();
  readonly onDidChangeTags = this._onDidChangeTags.event;

  private readonly _onDidChangeRemote = new vscode.EventEmitter<void>();
  readonly onDidChangeRemote = this._onDidChangeRemote.event;

  constructor(storage: JsonStorage) {
    this.storage = storage;
  }

  getStorageFilePath(): string {
    return this.storage.getFilePath();
  }

  async load(): Promise<void> {
    const data = await this.storage.load();
    this.projects.clear();
    for (const p of data.projects) {
      this.projects.set(p.id, p);
    }
    this.tags = data.tags;
    this.remotePaths = data.remote ?? {};
    log(`Store loaded: ${this.projects.size} projects, ${this.tags.length} tags`);
    this._onDidChange.fire();
    this._onDidChangeTags.fire();
  }

  private async persist(): Promise<void> {
    const data: StorageData = {
      version: 1,
      projects: this.getAllProjects(),
      tags: this.tags,
      remote: this.remotePaths,
    };
    await this.storage.save(data);
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  getProjectByPath(rootPath: string): Project | undefined {
    const normalized = rootPath.replace(/\\/g, '/');
    for (const p of this.projects.values()) {
      if (p.rootPath.replace(/\\/g, '/') === normalized) {
        return p;
      }
    }
    return undefined;
  }

  async addProject(rootPath: string, name?: string): Promise<Project> {
    const existing = this.getProjectByPath(rootPath);
    if (existing) {
      this._onDidChange.fire();
      return existing;
    }

    const project: Project = {
      id: crypto.randomUUID(),
      name: name || getFolderName(rootPath),
      rootPath,
      tags: [],
      isFavorite: false,
      lastOpenedAt: null,
      addedAt: Date.now(),
      isAvailable: true,
    };

    this.projects.set(project.id, project);
    await this.persist();
    this._onDidChange.fire();
    log(`Added project: ${project.name} (${rootPath})`);
    return project;
  }

  async removeProject(id: string): Promise<boolean> {
    const removed = this.projects.delete(id);
    if (removed) {
      await this.persist();
      this._onDidChange.fire();
    }
    return removed;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) {
      return undefined;
    }

    Object.assign(project, updates);
    await this.persist();
    this._onDidChange.fire();
    return project;
  }

  async markOpened(rootPath: string): Promise<void> {
    const project = this.getProjectByPath(rootPath);
    if (project) {
      project.lastOpenedAt = Date.now();
      await this.persist();
      this._onDidChange.fire();
    }
  }

  async toggleFavorite(id: string): Promise<boolean | undefined> {
    const project = this.projects.get(id);
    if (!project) {
      return undefined;
    }
    project.isFavorite = !project.isFavorite;
    await this.persist();
    this._onDidChange.fire();
    return project.isFavorite;
  }

  async setProjectTags(id: string, tags: string[]): Promise<void> {
    const project = this.projects.get(id);
    if (project) {
      project.tags = tags;
      await this.persist();
      this._onDidChange.fire();
    }
  }

  // Tag management
  getTags(): Tag[] {
    return [...this.tags].sort((a, b) => a.name.localeCompare(b.name));
  }

  async addTag(name: string, color?: string): Promise<Tag> {
    const existing = this.tags.find((t) => t.name === name);
    if (existing) {
      return existing;
    }
    const tag: Tag = { name, color };
    this.tags.push(tag);
    await this.persist();
    this._onDidChangeTags.fire();
    return tag;
  }

  async removeTag(name: string): Promise<void> {
    this.tags = this.tags.filter((t) => t.name !== name);
    // Remove tag from all projects
    for (const project of this.projects.values()) {
      project.tags = project.tags.filter((t) => t !== name);
    }
    await this.persist();
    this._onDidChangeTags.fire();
    this._onDidChange.fire();
  }

  async updateTagColor(name: string, color: string): Promise<void> {
    const tag = this.tags.find((t) => t.name === name);
    if (tag) {
      tag.color = color;
      await this.persist();
      this._onDidChangeTags.fire();
    }
  }

  async renameTag(oldName: string, newName: string): Promise<void> {
    const tag = this.tags.find((t) => t.name === oldName);
    if (tag) {
      tag.name = newName;
      for (const project of this.projects.values()) {
        project.tags = project.tags.map((t) => (t === oldName ? newName : t));
      }
      await this.persist();
      this._onDidChangeTags.fire();
      this._onDidChange.fire();
    }
  }

  async setAvailability(id: string, available: boolean): Promise<void> {
    const project = this.projects.get(id);
    if (project && project.isAvailable !== available) {
      project.isAvailable = available;
      await this.persist();
      this._onDidChange.fire();
    }
  }

  // Remote path management
  getRemotePaths(): Record<string, string> {
    return { ...this.remotePaths };
  }

  getRemotePath(alias: string): string | undefined {
    return this.remotePaths[alias];
  }

  async setRemotePath(alias: string, path: string): Promise<void> {
    if (path) {
      this.remotePaths[alias] = path;
    } else {
      delete this.remotePaths[alias];
    }
    await this.persist();
    this._onDidChangeRemote.fire();
  }

  dispose(): void {
    this._onDidChange.dispose();
    this._onDidChangeTags.dispose();
    this._onDidChangeRemote.dispose();
  }
}
