import { vi } from 'vitest';

type Listener = (...args: unknown[]) => void;

export class EventEmitter<T = void> {
  private listeners: Listener[] = [];

  event = (listener: Listener) => {
    this.listeners.push(listener);
    return { dispose: () => { this.listeners = this.listeners.filter(l => l !== listener); } };
  };

  fire(data?: T) {
    for (const listener of this.listeners) {
      listener(data);
    }
  }

  dispose() {
    this.listeners = [];
  }
}

export const Uri = {
  file: (path: string) => ({ fsPath: path, scheme: 'file', path }),
  parse: (str: string) => ({ fsPath: str, scheme: 'file', path: str }),
};

export class RelativePattern {
  constructor(public base: unknown, public pattern: string) {}
}

export const window = {
  createOutputChannel: vi.fn(() => ({
    appendLine: vi.fn(),
    dispose: vi.fn(),
  })),
  showInformationMessage: vi.fn(),
  showWarningMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  createQuickPick: vi.fn(),
};

export const workspace = {
  createFileSystemWatcher: vi.fn(() => ({
    onDidChange: vi.fn(),
    onDidCreate: vi.fn(),
    onDidDelete: vi.fn(),
    dispose: vi.fn(),
  })),
  getConfiguration: vi.fn(() => ({
    get: vi.fn(),
    update: vi.fn(),
  })),
};

export const ThemeIcon = class ThemeIcon {
  constructor(public id: string) {}
};
