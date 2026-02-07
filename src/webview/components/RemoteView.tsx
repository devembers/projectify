import { useMemo, useState, useRef, useEffect } from 'react';
import type { SSHHost } from '../../types.js';
import { postMessage } from '../vscodeApi.js';

interface ResolvedHost {
  hostname: string;
  user?: string;
  port?: number;
  identityFile?: string;
  aliases: string[];
}

function deduplicateHosts(hosts: SSHHost[]): ResolvedHost[] {
  const map = new Map<string, ResolvedHost>();
  for (const h of hosts) {
    const hostname = h.hostname ?? h.host;
    const key = `${h.user ?? ''}@${hostname}:${h.port ?? 22}`;
    const existing = map.get(key);
    if (existing) {
      existing.aliases.push(h.host);
    } else {
      map.set(key, {
        hostname,
        user: h.user,
        port: h.port,
        identityFile: h.identityFile,
        aliases: [h.host],
      });
    }
  }
  return Array.from(map.values());
}

interface RemoteViewProps {
  sshHosts: SSHHost[];
  remotePaths: Record<string, string>;
}

export function RemoteView({ sshHosts, remotePaths }: RemoteViewProps) {
  const hosts = useMemo(() => deduplicateHosts(sshHosts), [sshHosts]);
  const [editingHost, setEditingHost] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingHost && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingHost]);

  const handleConnect = (alias: string) => {
    postMessage({ type: 'action:connectRemoteHost', host: alias });
  };

  const startEditing = (alias: string, currentPath: string) => {
    setEditingHost(alias);
    setEditValue(currentPath);
  };

  const saveEdit = () => {
    if (editingHost) {
      postMessage({ type: 'action:setRemotePath', host: editingHost, path: editValue.trim() });
      setEditingHost(null);
    }
  };

  const cancelEdit = () => {
    setEditingHost(null);
  };

  if (hosts.length === 0) {
    return (
      <div className="remote-view">
        <div className="remote-view__empty">
          <span className="codicon codicon-info" /> No hosts found in ~/.ssh/config
        </div>
      </div>
    );
  }

  return (
    <div className="remote-view">
      <div className="remote-view__host-list">
        {hosts.map((h) => {
          const primaryAlias = h.aliases[0];
          const showPort = h.port != null && h.port !== 22;
          const storedPath = remotePaths[primaryAlias];
          const derivedPath = h.user ? `/home/${h.user}` : null;
          const displayPath = storedPath ?? derivedPath ?? '/';
          const isWarning = !storedPath && !derivedPath;
          const isEditing = editingHost === primaryAlias;

          return (
            <button
              key={primaryAlias}
              className="remote-view__card"
              onClick={() => handleConnect(primaryAlias)}
              title={`Connect to ${primaryAlias}`}
            >
              <div className="remote-view__card-header">
                <span className="codicon codicon-remote" />
                <span className="remote-view__card-title">{h.aliases.join(', ')}</span>
              </div>
              <div
                className={`remote-view__card-path${isWarning ? ' remote-view__card-path--warning' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isEditing) {
                    startEditing(primaryAlias, displayPath);
                  }
                }}
              >
                {isEditing ? (
                  <input
                    ref={inputRef}
                    className="remote-view__path-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveEdit();
                      } else if (e.key === 'Escape') {
                        cancelEdit();
                      }
                    }}
                    onBlur={saveEdit}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    {isWarning && <span className="codicon codicon-warning" />}
                    Opens <code>{displayPath}</code>
                    <span className="remote-view__edit-icon codicon codicon-edit" />
                  </>
                )}
              </div>
              <dl className="remote-view__card-details">
                <dt>Host</dt>
                <dd>{h.user ? `${h.user}@${h.hostname}` : h.hostname}{showPort ? `:${h.port}` : ''}</dd>
                {h.identityFile && (
                  <>
                    <dt>Key</dt>
                    <dd>{h.identityFile.replace(/^.*\//, '')}</dd>
                  </>
                )}
              </dl>
            </button>
          );
        })}
      </div>
    </div>
  );
}
