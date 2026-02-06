import { useState, useEffect } from 'react';

export interface EnvVarDraft {
  key: string;
  value: string;
}

interface EnvVarEditorProps {
  envVars: Record<string, string>;
  onChange: (envVars: Record<string, string>) => void;
  pendingRef?: React.MutableRefObject<EnvVarDraft>;
}

export function EnvVarEditor({ envVars, onChange, pendingRef }: EnvVarEditorProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (pendingRef) {
      pendingRef.current = { key: newKey, value: newValue };
    }
  }, [newKey, newValue, pendingRef]);

  const entries = Object.entries(envVars);

  const handleAdd = () => {
    const key = newKey.trim();
    if (!key) return;
    onChange({ ...envVars, [key]: newValue });
    setNewKey('');
    setNewValue('');
  };

  const handleRemove = (key: string) => {
    const next = { ...envVars };
    delete next[key];
    onChange(next);
  };

  const handleValueChange = (key: string, value: string) => {
    onChange({ ...envVars, [key]: value });
  };

  return (
    <div className="env-var-editor">
      {entries.length > 0 && (
        <div className="env-var-editor__list">
          {entries.map(([key, value]) => (
            <div key={key} className="env-var-editor__row">
              <span className="env-var-editor__key">{key}</span>
              <input
                className="env-var-editor__value"
                type="text"
                value={value}
                onChange={(e) => handleValueChange(key, e.target.value)}
              />
              <button
                className="env-var-editor__remove"
                onClick={() => handleRemove(key)}
                title="Remove"
              >
                <span className="codicon codicon-close" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="env-var-editor__add">
        <input
          className="env-var-editor__add-key"
          type="text"
          placeholder="KEY"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          className="env-var-editor__add-value"
          type="text"
          placeholder="value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          className="env-var-editor__add-btn"
          onClick={handleAdd}
          disabled={!newKey.trim()}
          title="Add variable"
        >
          <span className="codicon codicon-add" />
        </button>
      </div>
    </div>
  );
}
