import { useState } from 'react';
import type { Project, Tag } from '../../types.js';
import { postMessage } from '../vscodeApi.js';
import { TagBadgeByName } from './TagBadge.js';
import { IconButton } from './IconButton.js';
import { EditDialog } from './EditDialog.js';
import { ConfirmDialog } from './ConfirmDialog.js';
import { IconPicker } from './IconPicker.js';

interface ProjectCardProps {
  project: Project;
  tags: Tag[];
  isCurrent: boolean;
  isActive: boolean;
  onConfigure: (projectId: string) => void;
  remoteAliases: string[];
}


export function ProjectCard({ project, tags, isCurrent, isActive, onConfigure, remoteAliases }: ProjectCardProps) {
  const [editing, setEditing] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleOpen = () => {
    postMessage({ type: 'action:openProject', projectId: project.id });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setEditing(true);
  };

  const handleEditConfirm = (newName: string) => {
    if (newName !== project.name) {
      postMessage({ type: 'action:editProject', projectId: project.id, newName });
    }
    setEditing(false);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    postMessage({ type: 'action:toggleFavorite', projectId: project.id });
  };

  const handleIconSelect = (icon: string | null) => {
    postMessage({ type: 'action:setProjectIcon', projectId: project.id, icon });
    setShowIconPicker(false);
  };

  const cardClass = [
    'project-card',
    isCurrent && 'project-card--current',
    !project.isAvailable && 'project-card--unavailable',
  ]
    .filter(Boolean)
    .join(' ');

  const iconName = !project.isAvailable
    ? 'warning'
    : project.customIcon ?? 'code';

  const showEmoji = project.isAvailable && project.emoji;

  return (
    <div>
      <div className={cardClass} onClick={handleOpen}>
        <div className="project-card__top-row">
          <span
            className="project-card__icon project-card__icon--clickable"
            onClick={(e) => {
              e.stopPropagation();
              setShowIconPicker(!showIconPicker);
            }}
            title="Change icon"
          >
            {showEmoji ? (
              <span className="project-card__emoji">{project.emoji}</span>
            ) : (
              <span className={`codicon codicon-${iconName}`} />
            )}
          </span>

          {(isCurrent || isActive) && (
            <span
              className={`project-card__status-dot ${isCurrent ? 'project-card__status-dot--current' : 'project-card__status-dot--active'}`}
              title={isCurrent ? 'Current project' : 'Open in another window'}
            />
          )}

          {editing ? (
            <div className="project-card__name--editing" onClick={(e) => e.stopPropagation()}>
              <EditDialog
                initialValue={project.name}
                onConfirm={handleEditConfirm}
                onCancel={() => setEditing(false)}
              />
            </div>
          ) : (
            <span className="project-card__name" onDoubleClick={handleDoubleClick} title={project.name}>
              {project.name}
            </span>
          )}
        </div>

        <div className="project-card__meta">
          {project.remoteHost && (
            <span className="project-card__remote">
              {project.remoteHost}
              {remoteAliases.length > 0 && (
                <span className="project-card__remote-aliases">
                  {' '}({remoteAliases.join(', ')})
                </span>
              )}
            </span>
          )}
        </div>

        {project.tags.length > 0 && (
          <div className="project-card__tags">
            {project.tags.map((tagName) => (
              <TagBadgeByName key={tagName} name={tagName} allTags={tags} />
            ))}
          </div>
        )}

        <div className="project-card__actions">
          <IconButton
            icon={project.isFavorite ? 'star-full' : 'star-empty'}
            title={project.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={handleToggleFavorite}
          />
          {project.terminalProfile && (
            <IconButton icon="terminal" title="Open in Terminal" onClick={(e) => {
              e.stopPropagation();
              postMessage({ type: 'action:openInTerminal', projectId: project.id });
            }} />
          )}
          {!project.remoteHost && (
            <IconButton icon="folder-opened" title="Reveal in Finder" onClick={(e) => {
              e.stopPropagation();
              postMessage({ type: 'action:revealInExplorer', projectId: project.id });
            }} />
          )}
          <IconButton icon="settings-gear" title="Configure" onClick={(e) => {
            e.stopPropagation();
            onConfigure(project.id);
          }} />
          <IconButton icon="trash" title="Remove" danger onClick={(e) => {
            e.stopPropagation();
            setConfirmingRemove(true);
          }} />
        </div>
      </div>

      {showIconPicker && (
        <div style={{ position: 'relative', zIndex: 20 }}>
          <IconPicker
            currentIcon={project.customIcon ?? null}
            onSelect={handleIconSelect}
            onClose={() => setShowIconPicker(false)}
          />
        </div>
      )}

      {confirmingRemove && (
        <ConfirmDialog
          message={`Remove "${project.name}"?`}
          confirmLabel="Remove"
          onConfirm={() => {
            postMessage({ type: 'action:removeProject', projectId: project.id });
            setConfirmingRemove(false);
          }}
          onCancel={() => setConfirmingRemove(false)}
        />
      )}
    </div>
  );
}
