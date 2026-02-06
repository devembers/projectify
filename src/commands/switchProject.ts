import * as vscode from 'vscode';
import { Project } from '../types.js';
import { ProjectStore } from '../core/ProjectStore.js';
import { shortenPath } from '../utils/fs.js';
import { openProject, openProjectInNewWindow } from './openProject.js';

interface ProjectQuickPickItem extends vscode.QuickPickItem {
  project: Project;
}

export async function switchProject(
  store: ProjectStore,
  forceNewWindow = false,
): Promise<void> {
  const quickPick = vscode.window.createQuickPick<ProjectQuickPickItem>();
  quickPick.placeholder = 'Switch to Project...';
  quickPick.matchOnDescription = true;
  quickPick.matchOnDetail = true;

  const projects = store.getAllProjects().filter((p) => p.isAvailable);
  const sorted = sortForQuickPick(projects);

  const items: ProjectQuickPickItem[] = [];
  for (const project of sorted) {
    const recency = project.lastOpenedAt ? formatRelativeTime(project.lastOpenedAt) : '';
    const favPrefix = project.isFavorite ? '★ ' : '';

    items.push({
      label: `${favPrefix}${project.name}`,
      description: shortenPath(project.rootPath),
      detail: recency || undefined,
      project,
      buttons: [
        {
          iconPath: new vscode.ThemeIcon('window'),
          tooltip: 'Open in New Window',
        },
      ],
    });
  }

  quickPick.items = items;

  return new Promise<void>((resolve) => {
    quickPick.onDidAccept(async () => {
      const selected = quickPick.selectedItems[0];
      if (selected) {
        quickPick.dispose();
        if (forceNewWindow) {
          await openProjectInNewWindow(selected.project, store);
        } else {
          await openProject(selected.project, store);
        }
      }
      resolve();
    });

    quickPick.onDidTriggerItemButton(async (e) => {
      quickPick.dispose();
      await openProjectInNewWindow(e.item.project, store);
      resolve();
    });

    quickPick.onDidHide(() => {
      quickPick.dispose();
      resolve();
    });

    quickPick.show();
  });
}

export function sortForQuickPick(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    // Favorites first
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }
    // Then by recency
    const aTime = a.lastOpenedAt ?? 0;
    const bTime = b.lastOpenedAt ?? 0;
    return bTime - aTime;
  });
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
