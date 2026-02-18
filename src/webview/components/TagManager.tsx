import { useState, useRef } from 'react';
import type { Project, Tag } from '../../types.js';
import { postMessage } from '../vscodeApi.js';
import { IconButton } from './IconButton.js';
import { EditDialog } from './EditDialog.js';
import { ConfirmDialog } from './ConfirmDialog.js';
import { useTheme, getTagPalette } from '../utils/themeUtils.js';

interface TagManagerProps {
  tags: Tag[];
  projects: Project[];
}

export function TagManager({ tags, projects }: TagManagerProps) {
  const themeKind = useTheme();
  const tagColors = getTagPalette(themeKind);
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [colorPickerTag, setColorPickerTag] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tagCounts = new Map<string, number>();
  for (const p of projects) {
    for (const t of p.tags) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }

  const handleCreateTag = () => {
    const name = newTagName.trim();
    if (!name) return;
    if (tags.some((t) => t.name === name)) return;
    postMessage({ type: 'action:createTag', name });
    setNewTagName('');
    inputRef.current?.focus();
  };

  const handleRename = (oldName: string, newName: string) => {
    if (newName !== oldName && !tags.some((t) => t.name === newName)) {
      postMessage({ type: 'action:renameTag', oldName, newName });
    }
    setEditingTag(null);
  };

  const handleDelete = (name: string) => {
    postMessage({ type: 'action:deleteTag', name });
    setConfirmDelete(null);
  };

  const handleColorChange = (tagName: string, color: string) => {
    postMessage({ type: 'action:updateTagColor', name: tagName, color });
    setColorPickerTag(null);
  };

  return (
    <div className="tag-manager">
      <div className="tag-manager__header">
        <span className="tag-manager__title">Tags</span>
      </div>

      <div className="tag-manager__create">
        <input
          ref={inputRef}
          className="tag-manager__create-input"
          placeholder="New tag name..."
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreateTag();
          }}
        />
        <IconButton icon="add" title="Create tag" onClick={handleCreateTag} />
      </div>

      {tags.length === 0 ? (
        <div className="tag-manager__empty">
          No tags yet. Create one above to organize your projects.
        </div>
      ) : (
        <div className="tag-manager__list">
          {tags.map((tag) => (
            <div key={tag.name}>
              <div className="tag-manager__item">
                <div style={{ position: 'relative' }}>
                  <div
                    className="tag-manager__color"
                    style={{ backgroundColor: tag.color ?? tagColors[0] }}
                    onClick={() =>
                      setColorPickerTag(colorPickerTag === tag.name ? null : tag.name)
                    }
                    title="Change color"
                  />
                  {colorPickerTag === tag.name && (
                    <div className="color-picker">
                      {tagColors.map((color) => (
                        <div
                          key={color}
                          className={`color-picker__swatch ${
                            tag.color === color ? 'color-picker__swatch--selected' : ''
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorChange(tag.name, color)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {editingTag === tag.name ? (
                  <div style={{ flex: 1 }}>
                    <EditDialog
                      initialValue={tag.name}
                      onConfirm={(newName) => handleRename(tag.name, newName)}
                      onCancel={() => setEditingTag(null)}
                    />
                  </div>
                ) : (
                  <>
                    <span className="tag-manager__name">{tag.name}</span>
                    <span className="tag-manager__count">{tagCounts.get(tag.name) ?? 0}</span>
                  </>
                )}

                <div className="tag-manager__actions">
                  <IconButton
                    icon="edit"
                    title="Rename"
                    onClick={() => setEditingTag(tag.name)}
                  />
                  <IconButton
                    icon="trash"
                    title="Delete"
                    danger
                    onClick={() => setConfirmDelete(tag.name)}
                  />
                </div>
              </div>

              {confirmDelete === tag.name && (
                <ConfirmDialog
                  message={`Delete tag "${tag.name}"? It will be removed from all projects.`}
                  confirmLabel="Delete"
                  onConfirm={() => handleDelete(tag.name)}
                  onCancel={() => setConfirmDelete(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
