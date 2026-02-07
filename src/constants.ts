export const EXTENSION_ID = 'projectify';

export const COMMANDS = {
  switchProject: `${EXTENSION_ID}.switchProject`,
  openProjectNewWindow: `${EXTENSION_ID}.openProjectNewWindow`,
  addProject: `${EXTENSION_ID}.addProject`,
  removeProject: `${EXTENSION_ID}.removeProject`,
  editProject: `${EXTENSION_ID}.editProject`,
  openProject: `${EXTENSION_ID}.openProject`,
  manageGroups: `${EXTENSION_ID}.manageGroups`,
  toggleFavorite: `${EXTENSION_ID}.toggleFavorite`,
  assignTags: `${EXTENSION_ID}.assignTags`,
  copyPath: `${EXTENSION_ID}.copyPath`,
  openInTerminal: `${EXTENSION_ID}.openInTerminal`,
  revealInFileExplorer: `${EXTENSION_ID}.revealInFileExplorer`,
  editStorageFile: `${EXTENSION_ID}.editStorageFile`,
} as const;

export const CONFIG = {
  sortBy: `${EXTENSION_ID}.sortBy`,
  openBehavior: `${EXTENSION_ID}.openBehavior`,
  showStatusBar: `${EXTENSION_ID}.showStatusBar`,
} as const;

export const VIEWS = {
  webview: 'projectifyView',
} as const;

export const STORAGE_FILE = 'projects.json';

