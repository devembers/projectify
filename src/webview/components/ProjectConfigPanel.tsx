import { useState, useMemo, useRef } from 'react';
import type { Project, Tag } from '../../types.js';
import { postMessage } from '../vscodeApi.js';
import { IconPicker } from './IconPicker.js';
import { EmojiPicker } from './EmojiPicker.js';
import { EnvVarEditor } from './EnvVarEditor.js';
import type { EnvVarDraft } from './EnvVarEditor.js';
import { GroupInput } from './GroupInput.js';

interface ProjectConfigPanelProps {
  project: Project;
  tags: Tag[];
  projects: Project[];
  onClose: () => void;
}

export function ProjectConfigPanel({ project, tags, projects, onClose }: ProjectConfigPanelProps) {
  const [name, setName] = useState(project.name);
  const [customIcon, setCustomIcon] = useState<string | null>(project.customIcon ?? null);
  const [emoji, setEmoji] = useState(project.emoji ?? '');
  const [group, setGroup] = useState(project.group ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>([...project.tags]);
  const [rootPath, setRootPath] = useState(project.rootPath);
  const [remoteHost, setRemoteHost] = useState(project.remoteHost ?? '');
  const [terminalProfile, setTerminalProfile] = useState(project.terminalProfile ?? '');
  const [envVars, setEnvVars] = useState<Record<string, string>>(
    project.envVars ? { ...project.envVars } : {},
  );
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const envVarPendingRef = useRef<EnvVarDraft>({ key: '', value: '' });

  const existingGroups = useMemo(() => {
    const groups = new Set<string>();
    for (const p of projects) {
      if (p.group) groups.add(p.group);
    }
    return Array.from(groups).sort();
  }, [projects]);

  const handleSave = () => {
    const updates: {
      name?: string;
      customIcon?: string | null;
      emoji?: string | null;
      group?: string | null;
      tags?: string[];
      rootPath?: string;
      remoteHost?: string | null;
      terminalProfile?: string;
      envVars?: Record<string, string>;
    } = {};

    if (name !== project.name) updates.name = name;
    if (customIcon !== (project.customIcon ?? null)) updates.customIcon = customIcon;
    if (emoji !== (project.emoji ?? '')) updates.emoji = emoji || null;
    // Normalize group: strip leading/trailing slashes, collapse empty segments
    const normalizedGroup = group.split('/').filter(Boolean).join('/') || null;
    if (normalizedGroup !== (project.group ?? null)) updates.group = normalizedGroup;
    if (JSON.stringify(selectedTags) !== JSON.stringify(project.tags)) updates.tags = selectedTags;
    if (rootPath !== project.rootPath) updates.rootPath = rootPath;
    const normalizedHost = remoteHost || null;
    if (normalizedHost !== (project.remoteHost ?? null)) updates.remoteHost = normalizedHost;
    if (terminalProfile !== (project.terminalProfile ?? '')) {
      updates.terminalProfile = terminalProfile || undefined;
    }
    // Auto-commit any pending env var input
    let finalEnvVars = envVars;
    const pendingKey = envVarPendingRef.current.key.trim();
    if (pendingKey) {
      finalEnvVars = { ...envVars, [pendingKey]: envVarPendingRef.current.value };
    }
    if (JSON.stringify(finalEnvVars) !== JSON.stringify(project.envVars ?? {})) {
      updates.envVars = Object.keys(finalEnvVars).length > 0 ? finalEnvVars : undefined;
    }

    if (Object.keys(updates).length > 0) {
      postMessage({
        type: 'action:updateProjectConfig',
        projectId: project.id,
        updates,
      });
    }
    onClose();
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName],
    );
  };

  return (
    <div className="project-config">
      <div className="project-config__header">
        <span className="project-config__title">Configure Project</span>
        <button className="project-config__close" onClick={onClose} title="Close">
          <span className="codicon codicon-close" />
        </button>
      </div>

      <div className="project-config__body">
        {/* Identity section */}
        <div className="project-config__section">
          <div className="project-config__field">
            <label className="project-config__label">Name</label>
            <input
              className="project-config__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="project-config__field">
            <label className="project-config__label">Icon</label>
            <div className="project-config__icon-row">
              <button
                className="project-config__icon-btn"
                onClick={() => { setShowIconPicker(!showIconPicker); setShowEmojiPicker(false); }}
              >
                <span className={`codicon codicon-${customIcon ?? 'code'}`} />
                <span>{customIcon ?? 'Default'}</span>
              </button>
              {customIcon && (
                <button
                  className="project-config__icon-btn"
                  onClick={() => setCustomIcon(null)}
                  title="Reset to default icon"
                >
                  <span className="codicon codicon-discard" />
                </button>
              )}
            </div>
            {showIconPicker && (
              <div style={{ position: 'relative', zIndex: 20 }}>
                <IconPicker
                  currentIcon={customIcon}
                  onSelect={(icon) => {
                    setCustomIcon(icon);
                    if (icon) setEmoji('');
                    setShowIconPicker(false);
                  }}
                  onClose={() => setShowIconPicker(false)}
                />
              </div>
            )}
          </div>

          <div className="project-config__field">
            <label className="project-config__label">Emoji</label>
            <div className="project-config__icon-row">
              <button
                className="project-config__icon-btn"
                onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowIconPicker(false); }}
              >
                <span>{emoji || 'None'}</span>
              </button>
              {emoji && (
                <button
                  className="project-config__icon-btn"
                  onClick={() => setEmoji('')}
                  title="Clear emoji"
                >
                  <span className="codicon codicon-discard" />
                </button>
              )}
            </div>
            {showEmojiPicker && (
              <div style={{ position: 'relative', zIndex: 20 }}>
                <EmojiPicker
                  currentEmoji={emoji || null}
                  onSelect={(e) => {
                    setEmoji(e ?? '');
                    if (e) setCustomIcon(null);
                    setShowEmojiPicker(false);
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
            <span className="project-config__hint">Overrides icon when set</span>
          </div>

          <div className="project-config__field">
            <label className="project-config__label">Tags</label>
            <div className="project-config__tag-list">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.name}
                    className={`project-config__tag ${isSelected ? 'project-config__tag--selected' : ''}`}
                    onClick={() => toggleTag(tag.name)}
                    style={isSelected && tag.color ? { backgroundColor: tag.color } : undefined}
                  >
                    {isSelected && <span className="codicon codicon-check" />}
                    {tag.name}
                  </button>
                );
              })}
              {tags.length === 0 && (
                <span className="project-config__hint">No tags created yet</span>
              )}
            </div>
          </div>

          <div className="project-config__field">
            <label className="project-config__label">Group</label>
            <GroupInput
              className="project-config__input"
              placeholder="e.g. Work/Frontend"
              value={group}
              onChange={setGroup}
              existingGroups={existingGroups}
              onSubmit={handleSave}
            />
            <span className="project-config__hint">Use / to create nested groups</span>
          </div>
        </div>

        {/* Location section */}
        <div className="project-config__section">
          <div className="project-config__section-title">Location</div>
          <div className="project-config__field">
            <label className="project-config__label">Path</label>
            <input
              className="project-config__input"
              type="text"
              value={rootPath}
              onChange={(e) => setRootPath(e.target.value)}
            />
          </div>
          {project.remoteHost && (
            <div className="project-config__field">
              <label className="project-config__label">Remote Host</label>
              <input
                className="project-config__input"
                type="text"
                value={remoteHost}
                onChange={(e) => setRemoteHost(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Launch section */}
        <div className="project-config__section">
          <div className="project-config__section-title">Launch</div>

          <div className="project-config__field">
            <label className="project-config__label">Terminal Profile</label>
            <input
              className="project-config__input"
              type="text"
              placeholder="Default shell"
              value={terminalProfile}
              onChange={(e) => setTerminalProfile(e.target.value)}
            />
            <span className="project-config__hint">Shell path for "Open in Terminal" (e.g. /bin/zsh)</span>
          </div>

          <div className="project-config__field">
            <label className="project-config__label">Environment Variables</label>
            <EnvVarEditor envVars={envVars} onChange={setEnvVars} pendingRef={envVarPendingRef} />
          </div>
        </div>
      </div>

      <div className="project-config__footer">
        <button className="project-config__btn project-config__btn--cancel" onClick={onClose}>
          Cancel
        </button>
        <button className="project-config__btn project-config__btn--save" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}
