import * as vscode from 'vscode';
import { Project, OpenBehavior } from '../types.js';
import { ProjectStore } from '../core/ProjectStore.js';
import { CONFIG } from '../constants.js';

export async function openProject(project: Project, store: ProjectStore): Promise<void> {
  const config = vscode.workspace.getConfiguration();
  const behavior = config.get<OpenBehavior>(CONFIG.openBehavior, 'currentWindow');

  let openInNewWindow = false;

  if (behavior === 'ask') {
    const choice = await vscode.window.showQuickPick(
      [
        { label: 'Current Window', value: false },
        { label: 'New Window', value: true },
      ],
      { placeHolder: 'Open project in...' },
    );
    if (!choice) {
      return;
    }
    openInNewWindow = choice.value;
  } else if (behavior === 'newWindow') {
    openInNewWindow = true;
  }

  const uri = vscode.Uri.file(project.rootPath);
  await store.markOpened(project.rootPath);
  await vscode.commands.executeCommand('vscode.openFolder', uri, openInNewWindow);
}

export async function openProjectInNewWindow(
  project: Project,
  store: ProjectStore,
): Promise<void> {
  const uri = vscode.Uri.file(project.rootPath);
  await store.markOpened(project.rootPath);
  await vscode.commands.executeCommand('vscode.openFolder', uri, true);
}
