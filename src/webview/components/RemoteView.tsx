import { useMemo } from 'react';
import type { SSHHost } from '../../types.js';
import { postMessage } from '../vscodeApi.js';

interface ResolvedHost {
  hostname: string;
  user?: string;
  port?: number;
  identityFile?: string;
  options?: Record<string, string>;
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
        options: h.options,
        aliases: [h.host],
      });
    }
  }
  return Array.from(map.values());
}

/** Format a camelCase or PascalCase SSH keyword into a readable label. */
function formatKey(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2');
}

interface RemoteViewProps {
  sshHosts: SSHHost[];
}

export function RemoteView({ sshHosts }: RemoteViewProps) {
  const hosts = useMemo(() => deduplicateHosts(sshHosts), [sshHosts]);

  const handleConnect = (alias: string) => {
    postMessage({ type: 'action:connectRemoteHost', host: alias });
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
              <dl className="remote-view__card-details">
                <dt>Host</dt>
                <dd>{h.user ? `${h.user}@${h.hostname}` : h.hostname}{showPort ? `:${h.port}` : ''}</dd>
                {h.identityFile && (
                  <>
                    <dt>Key</dt>
                    <dd>{h.identityFile.replace(/^.*\//, '')}</dd>
                  </>
                )}
                {h.options && Object.entries(h.options).map(([k, v]) => (
                  <span className="remote-view__detail-pair" key={k}>
                    <dt>{formatKey(k)}</dt>
                    <dd>{v}</dd>
                  </span>
                ))}
              </dl>
            </button>
          );
        })}
      </div>
    </div>
  );
}
