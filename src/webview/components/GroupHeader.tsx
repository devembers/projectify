import { useState } from 'react';
import { EditDialog } from './EditDialog.js';

interface GroupHeaderProps {
  label: string;
  count: number;
  collapsed: boolean;
  onToggle: (recursive: boolean) => void;
  onRename?: (newName: string) => void;
}

export function GroupHeader({ label, count, collapsed, onToggle, onRename }: GroupHeaderProps) {
  const [editing, setEditing] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    onToggle(e.altKey);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!onRename) return;
    e.stopPropagation();
    setEditing(true);
  };

  const handleRenameConfirm = (newName: string) => {
    setEditing(false);
    if (newName !== label && onRename) {
      onRename(newName);
    }
  };

  return (
    <div className="group-header" onClick={handleClick}>
      <span
        className={`group-header__chevron ${collapsed ? 'group-header__chevron--collapsed' : ''}`}
      >
        <span className="codicon codicon-chevron-down" />
      </span>
      {editing ? (
        <span className="group-header__name--editing" onClick={(e) => e.stopPropagation()}>
          <EditDialog
            initialValue={label}
            onConfirm={handleRenameConfirm}
            onCancel={() => setEditing(false)}
          />
        </span>
      ) : (
        <span onDoubleClick={handleDoubleClick}>{label}</span>
      )}
      {!editing && count > 1 && <span className="group-header__count">{count}</span>}
    </div>
  );
}
