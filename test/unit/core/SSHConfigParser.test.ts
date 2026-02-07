import { describe, it, expect, vi } from 'vitest';

vi.mock('vscode', () => ({
  EventEmitter: class EventEmitter {
    event = vi.fn();
    fire = vi.fn();
    dispose = vi.fn();
  },
  Uri: { file: (p: string) => ({ fsPath: p }) },
  RelativePattern: class RelativePattern {
    constructor(public base: unknown, public pattern: string) {}
  },
  workspace: {
    createFileSystemWatcher: vi.fn(() => ({
      onDidChange: vi.fn(),
      onDidCreate: vi.fn(),
      dispose: vi.fn(),
    })),
  },
}));

vi.mock('../../../src/utils/logger.js', () => ({
  log: vi.fn(),
  logError: vi.fn(),
}));

import { parseSSHConfig } from '../../../src/core/SSHConfigParser.js';

describe('parseSSHConfig', () => {
  it('returns empty array for empty string', () => {
    expect(parseSSHConfig('')).toEqual([]);
  });

  it('returns empty array for comments only', () => {
    const config = `# This is a comment\n# Another comment`;
    expect(parseSSHConfig(config)).toEqual([]);
  });

  it('parses a single host block', () => {
    const config = `Host myserver\n  HostName 192.168.1.1\n  User admin`;
    const hosts = parseSSHConfig(config);
    expect(hosts).toEqual([
      { host: 'myserver', hostname: '192.168.1.1', user: 'admin' },
    ]);
  });

  it('parses multiple host blocks', () => {
    const config = `Host server1\n  HostName 10.0.0.1\n\nHost server2\n  HostName 10.0.0.2`;
    const hosts = parseSSHConfig(config);
    expect(hosts).toHaveLength(2);
    expect(hosts[0].host).toBe('server1');
    expect(hosts[1].host).toBe('server2');
  });

  it('parses port as number', () => {
    const config = `Host myserver\n  Port 2222`;
    const hosts = parseSSHConfig(config);
    expect(hosts[0].port).toBe(2222);
  });

  it('ignores invalid port', () => {
    const config = `Host myserver\n  Port abc`;
    const hosts = parseSSHConfig(config);
    expect(hosts[0].port).toBeUndefined();
  });

  it('parses IdentityFile', () => {
    const config = `Host myserver\n  IdentityFile ~/.ssh/id_rsa`;
    const hosts = parseSSHConfig(config);
    expect(hosts[0].identityFile).toBe('~/.ssh/id_rsa');
  });

  it('skips wildcard host patterns with *', () => {
    const config = `Host *\n  ServerAliveInterval 60`;
    expect(parseSSHConfig(config)).toEqual([]);
  });

  it('skips wildcard host patterns with ?', () => {
    const config = `Host server?\n  User admin`;
    expect(parseSSHConfig(config)).toEqual([]);
  });

  it('skips partial wildcard patterns like *.domain', () => {
    const config = `Host *.example.com\n  User deploy`;
    expect(parseSSHConfig(config)).toEqual([]);
  });

  it('handles mixed wildcard and concrete hosts on same line', () => {
    const config = `Host myserver *\n  HostName 10.0.0.1`;
    const hosts = parseSSHConfig(config);
    // Only the concrete alias should be kept
    expect(hosts).toHaveLength(1);
    expect(hosts[0].host).toBe('myserver');
    expect(hosts[0].hostname).toBe('10.0.0.1');
  });

  it('handles multiple aliases on a single Host line', () => {
    const config = `Host pn51 b backend\n  HostName 192.168.1.51\n  User pi`;
    const hosts = parseSSHConfig(config);
    expect(hosts).toHaveLength(3);
    expect(hosts[0]).toEqual({ host: 'pn51', hostname: '192.168.1.51', user: 'pi' });
    expect(hosts[1]).toEqual({ host: 'b', hostname: '192.168.1.51', user: 'pi' });
    expect(hosts[2]).toEqual({ host: 'backend', hostname: '192.168.1.51', user: 'pi' });
  });

  it('handles = separator for keywords', () => {
    const config = `Host myserver\n  HostName=10.0.0.1`;
    const hosts = parseSSHConfig(config);
    expect(hosts[0].hostname).toBe('10.0.0.1');
  });

  it('handles lines with leading whitespace', () => {
    const config = `  Host myserver\n    HostName 10.0.0.1`;
    const hosts = parseSSHConfig(config);
    expect(hosts).toHaveLength(1);
    expect(hosts[0].hostname).toBe('10.0.0.1');
  });

  it('captures unrecognized keywords in options', () => {
    const config = `Host myserver\n  HostName 10.0.0.1\n  ProxyJump bastion`;
    const hosts = parseSSHConfig(config);
    expect(hosts).toHaveLength(1);
    expect(hosts[0]).toEqual({ host: 'myserver', hostname: '10.0.0.1', options: { ProxyJump: 'bastion' } });
  });

  it('is case-insensitive for keywords', () => {
    const config = `host myserver\n  hostname 10.0.0.1\n  user admin`;
    const hosts = parseSSHConfig(config);
    expect(hosts).toEqual([
      { host: 'myserver', hostname: '10.0.0.1', user: 'admin' },
    ]);
  });

  it('handles the last host block without trailing newline', () => {
    const config = `Host myserver\n  HostName 10.0.0.1`;
    const hosts = parseSSHConfig(config);
    expect(hosts).toHaveLength(1);
    expect(hosts[0].hostname).toBe('10.0.0.1');
  });
});
