export interface Project {
  id: string;
  name: string;
  rootPath: string;
  tags: string[];
  group?: string;
  isFavorite: boolean;
  lastOpenedAt: number | null;
  addedAt: number;
  isAvailable: boolean;
  customIcon?: string;
  emoji?: string;
  remoteHost?: string;
  openCommand?: string;
  terminalProfile?: string;
  envVars?: Record<string, string>;
}

export interface Tag {
  name: string;
  color?: string;
}

export interface SSHHost {
  host: string;
  hostname?: string;
  user?: string;
  port?: number;
  identityFile?: string;
}

export type SortBy = 'name' | 'recency';
export type OpenBehavior = 'currentWindow' | 'newWindow' | 'ask';

export interface StorageData {
  version: number;
  projects: Project[];
  tags: Tag[];
}

