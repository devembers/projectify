import * as vscode from 'vscode';
import { ProjectStore } from '../core/ProjectStore.js';
import { WindowTracker } from '../core/WindowTracker.js';
import { SSHConfigParser } from '../core/SSHConfigParser.js';
import { CONFIG, VIEWS } from '../constants.js';
import { log, logError } from '../utils/logger.js';
import type {
  HostToWebviewMessage,
  WebviewToHostMessage,
  WebViewConfig,
} from '../shared/protocol.js';
import type { Project } from '../types.js';

export class ProjectWebViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = VIEWS.webview;

  private webviewView?: vscode.WebviewView;
  private disposables: vscode.Disposable[] = [];

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly store: ProjectStore,
    private readonly windowTracker: WindowTracker,
    private readonly sshParser: SSHConfigParser,
  ) {}

  public showAddPanel(): void {
    this.postMessage({ type: 'action:showAddPanel' });
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.webviewView = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist')],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    // Listen for messages from webview
    this.disposables.push(
      webviewView.webview.onDidReceiveMessage((msg: WebviewToHostMessage) => {
        this.handleMessage(msg).catch((err) => logError('handleMessage failed', err));
      }),
    );

    // Push state when store changes
    this.disposables.push(
      this.store.onDidChange(() => this.pushProjects()),
      this.store.onDidChangeTags(() => this.pushTags()),
      this.windowTracker.onDidChange(() => this.pushActiveProjects()),
      this.sshParser.onDidChange(() => this.pushSshHosts()),
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('projectify.sortBy')) {
          this.pushConfig();
        }
      }),
    );

    webviewView.onDidDispose(() => {
      for (const d of this.disposables) {
        d.dispose();
      }
      this.disposables = [];
      this.webviewView = undefined;
    });
  }

  // ── Message handling ──

  private async handleMessage(msg: WebviewToHostMessage): Promise<void> {
    switch (msg.type) {
      case 'action:ready':
        await this.sendInitState();
        break;

      case 'action:openProject': {
        const project = this.store.getProject(msg.projectId);
        if (project) {
          let uri: vscode.Uri;
          if (project.remoteHost) {
            uri = vscode.Uri.parse(
              `vscode-remote://ssh-remote+${project.remoteHost}${project.rootPath}`,
            );
          } else {
            uri = vscode.Uri.file(project.rootPath);
          }
          await this.store.markOpened(project.rootPath);
          await vscode.commands.executeCommand('vscode.openFolder', uri, {
            forceNewWindow: msg.newWindow ?? false,
          });
        }
        break;
      }

      case 'action:toggleFavorite':
        await this.store.toggleFavorite(msg.projectId);
        break;

      case 'action:editProject':
        await this.store.updateProject(msg.projectId, { name: msg.newName });
        break;

      case 'action:removeProject':
        await this.store.removeProject(msg.projectId);
        break;

      case 'action:copyPath': {
        const p = this.store.getProject(msg.projectId);
        if (p) {
          const display = p.remoteHost ? `${p.remoteHost}:${p.rootPath}` : p.rootPath;
          await vscode.env.clipboard.writeText(display);
          vscode.window.showInformationMessage('Path copied to clipboard');
        }
        break;
      }

      case 'action:openInTerminal': {
        const p = this.store.getProject(msg.projectId);
        if (p) {
          const opts: vscode.TerminalOptions = {
            name: p.name,
            cwd: p.remoteHost ? undefined : p.rootPath,
          };
          if (p.terminalProfile) {
            opts.shellPath = p.terminalProfile;
          }
          if (p.envVars && Object.keys(p.envVars).length > 0) {
            opts.env = p.envVars;
          }
          const terminal = vscode.window.createTerminal(opts);
          terminal.show();
        }
        break;
      }

      case 'action:revealInExplorer': {
        const p = this.store.getProject(msg.projectId);
        if (p && !p.remoteHost) {
          await vscode.commands.executeCommand(
            'revealFileInOS',
            vscode.Uri.file(p.rootPath),
          );
        }
        break;
      }

      case 'action:assignTags':
        await this.store.setProjectTags(msg.projectId, msg.tags);
        break;

      case 'action:createTag':
        await this.store.addTag(msg.name, msg.color);
        break;

      case 'action:renameTag':
        await this.store.renameTag(msg.oldName, msg.newName);
        break;

      case 'action:deleteTag':
        await this.store.removeTag(msg.name);
        break;

      case 'action:updateTagColor':
        await this.store.updateTagColor(msg.name, msg.color);
        break;

      case 'action:addProject':
        await vscode.commands.executeCommand('projectify.addProject');
        break;

      case 'action:openSettings':
        await vscode.commands.executeCommand(
          'workbench.action.openSettings',
          'projectify',
        );
        break;

      case 'action:updateConfig': {
        const target = vscode.ConfigurationTarget.Global;
        await vscode.workspace
          .getConfiguration()
          .update(`projectify.${msg.key}`, msg.value, target);
        break;
      }

      case 'action:setProjectIcon':
        await this.store.updateProject(msg.projectId, {
          customIcon: msg.icon ?? undefined,
        });
        break;

      case 'action:addLocalProject': {
        const project = await this.store.addProject(msg.path, msg.name);
        if (msg.group) {
          await this.store.updateProject(project.id, { group: msg.group });
        }
        break;
      }

      case 'action:addSshProject': {
        const updates: Partial<import('../types.js').Project> = { remoteHost: msg.host };
        if (msg.group) {
          updates.group = msg.group;
        }
        const project = await this.store.addProject(msg.remotePath, msg.name);
        await this.store.updateProject(project.id, updates);
        break;
      }

      case 'action:browseLocalFolder': {
        const homeDir = require('os').homedir();
        const defaultUri = vscode.Uri.file(`${homeDir}/Downloads`);
        const uris = await vscode.window.showOpenDialog({
          defaultUri,
          canSelectFolders: true,
          canSelectFiles: false,
          canSelectMany: false,
          openLabel: 'Select Folder',
        });
        if (uris && uris.length > 0) {
          this.postMessage({
            type: 'state:browsedPath',
            path: uris[0].fsPath,
          });
        }
        break;
      }

      case 'action:renameGroup': {
        const { oldPath, newName } = msg;
        // Build the new path: replace the last segment of oldPath with newName
        const segments = oldPath.split('/');
        segments[segments.length - 1] = newName;
        const newPath = segments.join('/');
        // Update all projects whose group starts with oldPath
        const allProjects = this.store.getAllProjects();
        for (const p of allProjects) {
          if (!p.group) continue;
          if (p.group === oldPath) {
            await this.store.updateProject(p.id, { group: newPath });
          } else if (p.group.startsWith(oldPath + '/')) {
            await this.store.updateProject(p.id, {
              group: newPath + p.group.slice(oldPath.length),
            });
          }
        }
        break;
      }

      case 'action:connectRemoteHost': {
        const uri = vscode.Uri.parse(
          `vscode-remote://ssh-remote+${msg.host}/`,
        );
        await vscode.commands.executeCommand('vscode.openFolder', uri, {
          forceNewWindow: true,
        });
        break;
      }

      case 'action:updateProjectConfig': {
        const { customIcon, emoji, remoteHost, group, ...rest } = msg.updates;
        const updates: Partial<Project> = { ...rest };
        if (customIcon !== undefined) updates.customIcon = customIcon ?? undefined;
        if (emoji !== undefined) updates.emoji = emoji ?? undefined;
        if (remoteHost !== undefined) updates.remoteHost = remoteHost ?? undefined;
        if (group !== undefined) updates.group = group ?? undefined;
        await this.store.updateProject(msg.projectId, updates);
        break;
      }
    }
  }

  // ── State pushing ──

  private async sendInitState(): Promise<void> {
    const projects = this.store.getAllProjects();
    let activeProjectPaths: string[] = [];
    let sshHosts: import('../types.js').SSHHost[] = [];
    try {
      activeProjectPaths = await this.windowTracker.getActiveProjectPaths();
    } catch (err) {
      logError('Failed to get active project paths', err);
    }
    try {
      sshHosts = await this.sshParser.getHosts();
    } catch (err) {
      logError('Failed to get SSH hosts', err);
    }
    this.postMessage({
      type: 'state:init',
      projects,
      tags: this.store.getTags(),
      config: this.getConfig(),
      currentProjectPath: this.getCurrentProjectPath(),
      activeProjectPaths,
      sshHosts,
    });
  }

  private pushProjects(): void {
    this.postMessage({
      type: 'state:projects',
      projects: this.store.getAllProjects(),
      currentProjectPath: this.getCurrentProjectPath(),
    });
  }

  private pushTags(): void {
    this.postMessage({
      type: 'state:tags',
      tags: this.store.getTags(),
    });
  }

  private pushConfig(): void {
    this.postMessage({
      type: 'state:config',
      config: this.getConfig(),
    });
  }

  private async pushActiveProjects(): Promise<void> {
    const activeProjectPaths = await this.windowTracker.getActiveProjectPaths();
    this.postMessage({
      type: 'state:activeProjects',
      activeProjectPaths,
    });
  }

  private async pushSshHosts(): Promise<void> {
    const hosts = await this.sshParser.getHosts();
    this.postMessage({
      type: 'state:sshHosts',
      hosts,
    });
  }

  private postMessage(msg: HostToWebviewMessage): void {
    this.webviewView?.webview.postMessage(msg);
  }

  // ── Helpers ──

  private getConfig(): WebViewConfig {
    const config = vscode.workspace.getConfiguration('projectify');
    return {
      sortBy: config.get('sortBy', 'name'),
    };
  }

  private getCurrentProjectPath(): string | null {
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null;
  }

  // ── HTML shell ──

  private getHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview.js'),
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview.css'),
    );
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <link rel="stylesheet" href="${styleUri}">
  <title>Projectify</title>
</head>
<body>
  <div id="root"><p style="padding:20px;color:var(--vscode-foreground);">Loading Projectify…</p></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}
