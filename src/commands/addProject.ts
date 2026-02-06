import * as vscode from 'vscode';
import { ProjectStore } from '../core/ProjectStore.js';

export async function addProject(store: ProjectStore): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    // Let user pick a folder
    const uris = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: 'Add as Project',
    });

    if (!uris || uris.length === 0) {
      return;
    }

    const project = await store.addProject(uris[0].fsPath);
    vscode.window.showInformationMessage(`Added project: ${project.name}`);
    return;
  }

  // Add current workspace folder(s)
  for (const folder of workspaceFolders) {
    await store.addProject(folder.uri.fsPath);
  }

  if (workspaceFolders.length === 1) {
    vscode.window.showInformationMessage(
      `Added project: ${workspaceFolders[0].name}`,
    );
  } else {
    vscode.window.showInformationMessage(
      `Added ${workspaceFolders.length} projects`,
    );
  }
}
