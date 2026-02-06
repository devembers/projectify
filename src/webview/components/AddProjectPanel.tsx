import { useState, useEffect, useMemo } from 'react';
import type { SSHHost, Project } from '../../types.js';
import { postMessage } from '../vscodeApi.js';
import { GroupInput } from './GroupInput.js';

interface ResolvedHost {
  /** The actual hostname/IP to connect to */
  target: string;
  /** user@host or just host */
  display: string;
  /** SSH config aliases that map to this target */
  aliases: string[];
}

function deduplicateHosts(hosts: SSHHost[]): ResolvedHost[] {
  const map = new Map<string, ResolvedHost>();
  for (const h of hosts) {
    const hostname = h.hostname ?? h.host;
    const display = h.user ? `${h.user}@${hostname}` : hostname;
    const key = `${h.user ?? ''}@${hostname}:${h.port ?? 22}`;
    const existing = map.get(key);
    if (existing) {
      existing.aliases.push(h.host);
    } else {
      map.set(key, { target: hostname, display, aliases: [h.host] });
    }
  }
  return Array.from(map.values());
}

interface AddProjectPanelProps {
  sshHosts: SSHHost[];
  browsedPath: string | null;
  projects: Project[];
  onClose: () => void;
}

type Tab = 'local' | 'ssh';

export function AddProjectPanel({ sshHosts, browsedPath, projects, onClose }: AddProjectPanelProps) {
  const [tab, setTab] = useState<Tab>('local');
  const [localPath, setLocalPath] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [remotePath, setRemotePath] = useState('');
  const resolvedHosts = useMemo(() => deduplicateHosts(sshHosts), [sshHosts]);
  const [group, setGroup] = useState('');

  const existingGroups = useMemo(() => {
    const groups = new Set<string>();
    for (const p of projects) {
      if (p.group) groups.add(p.group);
    }
    return Array.from(groups).sort();
  }, [projects]);

  // When a browsed path comes back from the native picker, populate the input
  useEffect(() => {
    if (browsedPath) {
      setLocalPath(browsedPath);
    }
  }, [browsedPath]);

  const handleAddLocal = () => {
    const trimmed = localPath.trim();
    if (!trimmed) return;
    postMessage({
      type: 'action:addLocalProject',
      path: trimmed,
      group: group.trim() || undefined,
    });
    onClose();
  };

  const handleAddSsh = () => {
    const host = selectedTarget.trim();
    const path = remotePath.trim();
    if (!host || !path) return;
    postMessage({
      type: 'action:addSshProject',
      host,
      remotePath: path,
      group: group.trim() || undefined,
    });
    onClose();
  };

  const handleBrowse = () => {
    postMessage({ type: 'action:browseLocalFolder' });
  };

  const sharedFields = (
    <>
      <label className="add-panel__label">Group</label>
      <GroupInput
        className="add-panel__input"
        placeholder="e.g. work/frontend"
        value={group}
        onChange={setGroup}
        existingGroups={existingGroups}
      />
    </>
  );

  return (
    <div className="add-panel">
      <div className="add-panel__header">
        <span className="add-panel__title">Add Project</span>
        <button className="add-panel__close" onClick={onClose} title="Close">
          <span className="codicon codicon-close" />
        </button>
      </div>

      <div className="add-panel__tabs">
        <button
          className={`add-panel__tab ${tab === 'local' ? 'add-panel__tab--active' : ''}`}
          onClick={() => setTab('local')}
        >
          <span className="codicon codicon-folder" /> Local
        </button>
        <button
          className={`add-panel__tab ${tab === 'ssh' ? 'add-panel__tab--active' : ''}`}
          onClick={() => setTab('ssh')}
        >
          <span className="codicon codicon-remote" /> SSH
        </button>
      </div>

      {tab === 'local' && (
        <div className="add-panel__form">
          <label className="add-panel__label">Folder Path</label>
          <div className="add-panel__input-row">
            <input
              className="add-panel__input"
              type="text"
              placeholder="/path/to/project"
              value={localPath}
              onChange={(e) => setLocalPath(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLocal()}
            />
            <button className="add-panel__browse" onClick={handleBrowse} title="Browse">
              <span className="codicon codicon-folder-opened" />
            </button>
          </div>
          {sharedFields}
          <button
            className="add-panel__submit"
            onClick={handleAddLocal}
            disabled={!localPath.trim()}
          >
            Add Project
          </button>
        </div>
      )}

      {tab === 'ssh' && (
        <div className="add-panel__form">
          <label className="add-panel__label">SSH Host</label>
          {resolvedHosts.length > 0 ? (
            <div className="add-panel__host-list">
              {resolvedHosts.map((h) => (
                <button
                  key={h.target}
                  className={`add-panel__host ${selectedTarget === h.target ? 'add-panel__host--selected' : ''}`}
                  onClick={() => setSelectedTarget(h.target)}
                >
                  <span className="codicon codicon-vm" />
                  <span className="add-panel__host-name">{h.display}</span>
                  <span className="add-panel__host-details">
                    {h.aliases.join(', ')}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="add-panel__empty-hosts">
              <span className="codicon codicon-info" /> No hosts found in ~/.ssh/config
            </div>
          )}

          <label className="add-panel__label">Remote Path</label>
          <input
            className="add-panel__input"
            type="text"
            placeholder="/home/user/project"
            value={remotePath}
            onChange={(e) => setRemotePath(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSsh()}
          />

          {sharedFields}

          <button
            className="add-panel__submit"
            onClick={handleAddSsh}
            disabled={!selectedTarget.trim() || !remotePath.trim()}
          >
            Add SSH Project
          </button>
        </div>
      )}
    </div>
  );
}
