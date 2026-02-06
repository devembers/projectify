import * as vscode from 'vscode';
import * as fs from 'fs';
import { JsonStorage } from './storage/JsonStorage.js';
import { ProjectStore } from './core/ProjectStore.js';
import { WindowTracker } from './core/WindowTracker.js';
import { SSHConfigParser } from './core/SSHConfigParser.js';
import { ProjectWebViewProvider } from './views/ProjectWebViewProvider.js';
import { StatusBarManager } from './statusbar/StatusBarManager.js';
import { registerCommands } from './commands/index.js';
import { VIEWS } from './constants.js';
import { initLogger, log, logError, disposeLogger } from './utils/logger.js';

let store: ProjectStore | undefined;
let statusBarManager: StatusBarManager | undefined;
let windowTracker: WindowTracker | undefined;
let sshParser: SSHConfigParser | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const outputChannel = initLogger();
  context.subscriptions.push(outputChannel);

  log('Projectify activating...');

  try {
    // Initialize storage
    const storage = new JsonStorage(context.globalStorageUri);
    store = new ProjectStore(storage);

    // Load cached data immediately (fast startup)
    await store.load();

    // Initialize window tracker
    windowTracker = new WindowTracker(context.globalStorageUri);
    windowTracker.startWatching();
    context.subscriptions.push(windowTracker);

    // Register current window's project
    const currentPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null;
    await windowTracker.register(currentPath);

    // Initialize SSH config parser
    sshParser = new SSHConfigParser();
    sshParser.startWatching();
    context.subscriptions.push(sshParser);

    // Initialize webview
    const webviewProvider = new ProjectWebViewProvider(
      context.extensionUri,
      store,
      windowTracker,
      sshParser,
    );
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(VIEWS.webview, webviewProvider, {
        webviewOptions: { retainContextWhenHidden: true },
      }),
    );

    // Initialize status bar
    statusBarManager = new StatusBarManager(store);
    context.subscriptions.push(statusBarManager);

    // Register all commands
    registerCommands(context, store, webviewProvider);

    // Track current workspace as opened
    await trackCurrentWorkspace(store);

    // Reload store when the user saves the storage file in the editor
    const storageFilePath = store.getStorageFilePath();
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((doc) => {
        if (doc.uri.fsPath === storageFilePath) {
          store!.load();
        }
      }),
    );

    // Check availability of existing projects
    checkProjectAvailability(store);

    log('Projectify activated successfully');
  } catch (err) {
    logError('Failed to activate Projectify', err);
  }
}

export async function deactivate(): Promise<void> {
  log('Projectify deactivating...');
  await windowTracker?.unregister();
  store?.dispose();
  disposeLogger();
}

async function trackCurrentWorkspace(store: ProjectStore): Promise<void> {
  const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspacePath) {
    const existing = store.getProjectByPath(workspacePath);
    if (existing) {
      await store.markOpened(workspacePath);
    } else {
      const project = await store.addProject(workspacePath);
      await store.markOpened(project.rootPath);
    }
  }
}

async function checkProjectAvailability(store: ProjectStore): Promise<void> {
  const projects = store.getAllProjects();
  for (const project of projects) {
    // Skip remote projects — can't check availability from local
    if (project.remoteHost) {
      continue;
    }
    try {
      const stat = await fs.promises.stat(project.rootPath);
      if (!stat.isDirectory()) {
        await store.setAvailability(project.id, false);
      } else {
        await store.setAvailability(project.id, true);
      }
    } catch {
      await store.setAvailability(project.id, false);
    }
  }
}
