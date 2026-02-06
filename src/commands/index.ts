import * as vscode from 'vscode';
import { Project } from '../types.js';
import { ProjectStore } from '../core/ProjectStore.js';
import { ProjectWebViewProvider } from '../views/ProjectWebViewProvider.js';
import { COMMANDS } from '../constants.js';
import { switchProject } from './switchProject.js';
import { removeProject } from './removeProject.js';
import { editProject } from './editProject.js';
import { openProject } from './openProject.js';
import { manageGroups, assignTags } from './manageGroups.js';

export function registerCommands(
  context: vscode.ExtensionContext,
  store: ProjectStore,
  provider: ProjectWebViewProvider,
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.switchProject, () =>
      switchProject(store),
    ),

    vscode.commands.registerCommand(COMMANDS.openProjectNewWindow, () =>
      switchProject(store, true),
    ),

    vscode.commands.registerCommand(COMMANDS.addProject, () => provider.showAddPanel()),

    vscode.commands.registerCommand(COMMANDS.removeProject, (projectOrItem?: Project | { project?: Project }) => {
      const project = resolveProject(projectOrItem);
      return removeProject(store, project);
    }),

    vscode.commands.registerCommand(COMMANDS.editProject, (projectOrItem?: Project | { project?: Project }) => {
      const project = resolveProject(projectOrItem);
      return editProject(store, project);
    }),

    vscode.commands.registerCommand(COMMANDS.openProject, (projectOrItem?: Project | { project?: Project }) => {
      const project = resolveProject(projectOrItem);
      if (project) {
        return openProject(project, store);
      }
    }),

    vscode.commands.registerCommand(COMMANDS.manageGroups, () => manageGroups(store)),

    vscode.commands.registerCommand(COMMANDS.toggleFavorite, (projectOrItem?: Project | { project?: Project }) => {
      const project = resolveProject(projectOrItem);
      if (project) {
        return store.toggleFavorite(project.id);
      }
    }),

    vscode.commands.registerCommand(COMMANDS.assignTags, (projectOrItem?: Project | { project?: Project }) => {
      const project = resolveProject(projectOrItem);
      return assignTags(store, project);
    }),

    vscode.commands.registerCommand(COMMANDS.copyPath, (projectOrItem?: Project | { project?: Project }) => {
      const project = resolveProject(projectOrItem);
      if (project) {
        vscode.env.clipboard.writeText(project.rootPath);
        vscode.window.showInformationMessage('Path copied to clipboard');
      }
    }),

    vscode.commands.registerCommand(COMMANDS.openInTerminal, (projectOrItem?: Project | { project?: Project }) => {
      const project = resolveProject(projectOrItem);
      if (project) {
        const terminal = vscode.window.createTerminal({
          name: project.name,
          cwd: project.rootPath,
        });
        terminal.show();
      }
    }),

    vscode.commands.registerCommand(COMMANDS.revealInFileExplorer, (projectOrItem?: Project | { project?: Project }) => {
      const project = resolveProject(projectOrItem);
      if (project) {
        vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(project.rootPath));
      }
    }),

    vscode.commands.registerCommand(COMMANDS.editStorageFile, async () => {
      const filePath = store.getStorageFilePath();
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
      await vscode.window.showTextDocument(doc);
    }),

  );
}

/** Resolve a Project from either a raw Project or a tree-item-like wrapper. */
function resolveProject(arg?: Project | { project?: Project }): Project | undefined {
  if (!arg) {
    return undefined;
  }
  if ('rootPath' in arg) {
    return arg as Project;
  }
  if ('project' in arg) {
    return arg.project;
  }
  return undefined;
}
