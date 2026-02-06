import * as vscode from 'vscode';
import { Project } from '../types.js';
import { ProjectStore } from '../core/ProjectStore.js';

export async function manageGroups(store: ProjectStore): Promise<void> {
  const action = await vscode.window.showQuickPick(
    [
      { label: '$(add) Create New Tag', action: 'create' as const },
      { label: '$(edit) Rename Tag', action: 'rename' as const },
      { label: '$(trash) Delete Tag', action: 'delete' as const },
    ],
    { placeHolder: 'Manage Tags' },
  );

  if (!action) {
    return;
  }

  switch (action.action) {
    case 'create':
      await createTag(store);
      break;
    case 'rename':
      await renameTag(store);
      break;
    case 'delete':
      await deleteTag(store);
      break;
  }
}

async function createTag(store: ProjectStore): Promise<void> {
  const name = await vscode.window.showInputBox({
    prompt: 'Tag name',
    validateInput: (value) => {
      if (!value.trim()) {
        return 'Tag name cannot be empty';
      }
      const existing = store.getTags().find((t) => t.name === value.trim());
      if (existing) {
        return 'Tag already exists';
      }
      return null;
    },
  });

  if (name) {
    await store.addTag(name.trim());
    vscode.window.showInformationMessage(`Created tag: ${name.trim()}`);
  }
}

async function renameTag(store: ProjectStore): Promise<void> {
  const tags = store.getTags();
  if (tags.length === 0) {
    vscode.window.showInformationMessage('No tags to rename.');
    return;
  }

  const selected = await vscode.window.showQuickPick(
    tags.map((t) => ({ label: t.name, tag: t })),
    { placeHolder: 'Select tag to rename' },
  );

  if (!selected) {
    return;
  }

  const newName = await vscode.window.showInputBox({
    prompt: 'New tag name',
    value: selected.tag.name,
    validateInput: (value) => {
      if (!value.trim()) {
        return 'Tag name cannot be empty';
      }
      if (value.trim() !== selected.tag.name) {
        const existing = store.getTags().find((t) => t.name === value.trim());
        if (existing) {
          return 'Tag already exists';
        }
      }
      return null;
    },
  });

  if (newName && newName.trim() !== selected.tag.name) {
    await store.renameTag(selected.tag.name, newName.trim());
    vscode.window.showInformationMessage(`Renamed tag to: ${newName.trim()}`);
  }
}

async function deleteTag(store: ProjectStore): Promise<void> {
  const tags = store.getTags();
  if (tags.length === 0) {
    vscode.window.showInformationMessage('No tags to delete.');
    return;
  }

  const selected = await vscode.window.showQuickPick(
    tags.map((t) => ({ label: t.name, tag: t })),
    { placeHolder: 'Select tag to delete' },
  );

  if (!selected) {
    return;
  }

  const confirm = await vscode.window.showWarningMessage(
    `Delete tag "${selected.tag.name}"? It will be removed from all projects.`,
    { modal: true },
    'Delete',
  );

  if (confirm === 'Delete') {
    await store.removeTag(selected.tag.name);
    vscode.window.showInformationMessage(`Deleted tag: ${selected.tag.name}`);
  }
}

export async function assignTags(
  store: ProjectStore,
  project?: Project,
): Promise<void> {
  if (!project) {
    return;
  }

  const allTags = store.getTags();

  if (allTags.length === 0) {
    const create = await vscode.window.showInformationMessage(
      'No tags exist yet. Create one?',
      'Create Tag',
    );
    if (create === 'Create Tag') {
      await createTag(store);
    }
    return;
  }

  const items = allTags.map((tag) => ({
    label: tag.name,
    picked: project!.tags.includes(tag.name),
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: `Assign tags to ${project.name}`,
    canPickMany: true,
  });

  if (selected) {
    const tagNames = selected.map((s) => s.label);
    await store.setProjectTags(project.id, tagNames);
  }
}
