/**
 * Typed message protocol for postMessage communication
 * between the extension host and the webview.
 */

import type { Project, Tag, SortBy, SSHHost } from '../types.js';
export type { SortBy };

// ── Host → Webview messages ──

export interface StateInitMessage {
  type: 'state:init';
  projects: Project[];
  tags: Tag[];
  config: WebViewConfig;
  currentProjectPath: string | null;
  activeProjectPaths: string[];
  sshHosts: SSHHost[];
}

export interface StateProjectsMessage {
  type: 'state:projects';
  projects: Project[];
  currentProjectPath: string | null;
}

export interface StateTagsMessage {
  type: 'state:tags';
  tags: Tag[];
}

export interface StateConfigMessage {
  type: 'state:config';
  config: WebViewConfig;
}

export interface StateActiveProjectsMessage {
  type: 'state:activeProjects';
  activeProjectPaths: string[];
}

export interface StateSshHostsMessage {
  type: 'state:sshHosts';
  hosts: SSHHost[];
}

export interface StateBrowsedPathMessage {
  type: 'state:browsedPath';
  path: string;
}

export interface ShowAddPanelMessage {
  type: 'action:showAddPanel';
}

export interface StatePathCompletionsMessage {
  type: 'state:pathCompletions';
  suggestions: string[];
  requestId: number;
}

export type HostToWebviewMessage =
  | StateInitMessage
  | StateProjectsMessage
  | StateTagsMessage
  | StateConfigMessage
  | StateActiveProjectsMessage
  | StateSshHostsMessage
  | StateBrowsedPathMessage
  | ShowAddPanelMessage
  | StatePathCompletionsMessage;

// ── Webview → Host messages ──

export interface ActionReadyMessage {
  type: 'action:ready';
}

export interface ActionOpenProjectMessage {
  type: 'action:openProject';
  projectId: string;
  newWindow?: boolean;
}

export interface ActionToggleFavoriteMessage {
  type: 'action:toggleFavorite';
  projectId: string;
}

export interface ActionEditProjectMessage {
  type: 'action:editProject';
  projectId: string;
  newName: string;
}

export interface ActionRemoveProjectMessage {
  type: 'action:removeProject';
  projectId: string;
}

export interface ActionCopyPathMessage {
  type: 'action:copyPath';
  projectId: string;
}

export interface ActionOpenInTerminalMessage {
  type: 'action:openInTerminal';
  projectId: string;
}

export interface ActionRevealInExplorerMessage {
  type: 'action:revealInExplorer';
  projectId: string;
}

export interface ActionAssignTagsMessage {
  type: 'action:assignTags';
  projectId: string;
  tags: string[];
}

export interface ActionCreateTagMessage {
  type: 'action:createTag';
  name: string;
  color?: string;
}

export interface ActionRenameTagMessage {
  type: 'action:renameTag';
  oldName: string;
  newName: string;
}

export interface ActionDeleteTagMessage {
  type: 'action:deleteTag';
  name: string;
}

export interface ActionUpdateTagColorMessage {
  type: 'action:updateTagColor';
  name: string;
  color: string;
}

export interface ActionAddProjectMessage {
  type: 'action:addProject';
}

export interface ActionOpenSettingsMessage {
  type: 'action:openSettings';
}

export interface ActionUpdateConfigMessage {
  type: 'action:updateConfig';
  key: string;
  value: unknown;
}

export interface ActionSetProjectIconMessage {
  type: 'action:setProjectIcon';
  projectId: string;
  icon: string | null;
}

export interface ActionAddLocalProjectMessage {
  type: 'action:addLocalProject';
  path: string;
  name?: string;
  group?: string;
}

export interface ActionAddSshProjectMessage {
  type: 'action:addSshProject';
  host: string;
  remotePath: string;
  name?: string;
  group?: string;
}

export interface ActionBrowseLocalFolderMessage {
  type: 'action:browseLocalFolder';
}

export interface ActionRenameGroupMessage {
  type: 'action:renameGroup';
  oldPath: string;
  newName: string;
}

export interface ActionUpdateProjectConfigMessage {
  type: 'action:updateProjectConfig';
  projectId: string;
  updates: {
    name?: string;
    customIcon?: string | null;
    emoji?: string | null;
    tags?: string[];
    group?: string | null;
    rootPath?: string;
    remoteHost?: string | null;
    openCommand?: string;
    terminalProfile?: string;
    envVars?: Record<string, string>;
  };
}

export interface ActionConnectRemoteHostMessage {
  type: 'action:connectRemoteHost';
  host: string;
}

export interface ActionCompletePathMessage {
  type: 'action:completePath';
  input: string;
  requestId: number;
}

export type WebviewToHostMessage =
  | ActionReadyMessage
  | ActionOpenProjectMessage
  | ActionToggleFavoriteMessage
  | ActionEditProjectMessage
  | ActionRemoveProjectMessage
  | ActionCopyPathMessage
  | ActionOpenInTerminalMessage
  | ActionRevealInExplorerMessage
  | ActionAssignTagsMessage
  | ActionCreateTagMessage
  | ActionRenameTagMessage
  | ActionDeleteTagMessage
  | ActionUpdateTagColorMessage
  | ActionAddProjectMessage
  | ActionOpenSettingsMessage
  | ActionUpdateConfigMessage
  | ActionSetProjectIconMessage
  | ActionAddLocalProjectMessage
  | ActionAddSshProjectMessage
  | ActionBrowseLocalFolderMessage
  | ActionRenameGroupMessage
  | ActionUpdateProjectConfigMessage
  | ActionConnectRemoteHostMessage
  | ActionCompletePathMessage;

// ── Shared config subset pushed to webview ──

export interface WebViewConfig {
  sortBy: SortBy;
  remoteDefaultPaths: Record<string, string>;
}
