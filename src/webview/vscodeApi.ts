/**
 * Typed wrapper around acquireVsCodeApi() for webview ↔ extension communication.
 */

import type { HostToWebviewMessage, WebviewToHostMessage } from '../shared/protocol.js';

interface VsCodeApi {
  postMessage(msg: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

const vscode = acquireVsCodeApi();

export function postMessage(msg: WebviewToHostMessage): void {
  vscode.postMessage(msg);
}

export function onMessage(handler: (msg: HostToWebviewMessage) => void): () => void {
  const listener = (event: MessageEvent) => {
    handler(event.data as HostToWebviewMessage);
  };
  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}

export function getPersistedState<T>(): T | undefined {
  return vscode.getState() as T | undefined;
}

export function setPersistedState<T>(state: T): void {
  vscode.setState(state);
}
