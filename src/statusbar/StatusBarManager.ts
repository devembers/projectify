import * as vscode from 'vscode';
import { ProjectStore } from '../core/ProjectStore.js';
import { COMMANDS, CONFIG } from '../constants.js';

export class StatusBarManager implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem;
  private disposables: vscode.Disposable[] = [];

  constructor(
    private store: ProjectStore,
  ) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100,
    );
    this.statusBarItem.command = COMMANDS.switchProject;
    this.statusBarItem.name = 'Projectify';

    this.disposables.push(
      store.onDidChange(() => this.update()),
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(CONFIG.showStatusBar)) {
          this.update();
        }
      }),
    );
  }

  async update(): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    const showStatusBar = config.get<boolean>(CONFIG.showStatusBar, true);

    if (!showStatusBar) {
      this.statusBarItem.hide();
      return;
    }

    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspacePath) {
      this.statusBarItem.hide();
      return;
    }

    const project = this.store.getProjectByPath(workspacePath);
    if (!project) {
      this.statusBarItem.hide();
      return;
    }

    this.statusBarItem.text = `$(folder) ${project.name}`;
    this.statusBarItem.tooltip = 'Click to switch project';
    this.statusBarItem.show();
  }

  dispose(): void {
    this.statusBarItem.dispose();
    for (const d of this.disposables) {
      d.dispose();
    }
  }
}
