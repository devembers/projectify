import * as vscode from 'vscode';
import { Project } from '../types.js';
import { ProjectStore } from '../core/ProjectStore.js';

export async function removeProject(
  store: ProjectStore,
  project?: Project,
): Promise<void> {
  if (!project) {
    // Show Quick Pick to select a project to remove
    const projects = store.getAllProjects();
    if (projects.length === 0) {
      vscode.window.showInformationMessage('No projects to remove.');
      return;
    }

    const items = projects.map((p) => ({
      label: p.name,
      description: p.rootPath,
      project: p,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a project to remove',
    });

    if (!selected) {
      return;
    }
    project = selected.project;
  }

  const confirm = await vscode.window.showWarningMessage(
    `Remove "${project.name}" from Projectify? (This does not delete the folder)`,
    { modal: true },
    'Remove',
  );

  if (confirm === 'Remove') {
    await store.removeProject(project.id);
    vscode.window.showInformationMessage(`Removed project: ${project.name}`);
  }
}
