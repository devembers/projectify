import * as vscode from 'vscode';
import { Project } from '../types.js';
import { ProjectStore } from '../core/ProjectStore.js';

export async function editProject(
  store: ProjectStore,
  project?: Project,
): Promise<void> {
  if (!project) {
    const projects = store.getAllProjects();
    if (projects.length === 0) {
      vscode.window.showInformationMessage('No projects to edit.');
      return;
    }

    const items = projects.map((p) => ({
      label: p.name,
      description: p.rootPath,
      project: p,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a project to edit',
    });

    if (!selected) {
      return;
    }
    project = selected.project;
  }

  const newName = await vscode.window.showInputBox({
    prompt: 'Project display name',
    value: project.name,
    validateInput: (value) => {
      if (!value.trim()) {
        return 'Name cannot be empty';
      }
      return null;
    },
  });

  if (newName !== undefined && newName !== project.name) {
    await store.updateProject(project.id, { name: newName.trim() });
    vscode.window.showInformationMessage(`Renamed project to: ${newName.trim()}`);
  }
}
