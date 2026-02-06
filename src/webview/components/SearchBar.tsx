import { useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="search-bar">
      <span className="search-bar__icon">
        <span className="codicon codicon-search" />
      </span>
      <input
        ref={inputRef}
        className="search-bar__input"
        type="text"
        placeholder="Search projects..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          title="Clear search"
        >
          <span className="codicon codicon-close" />
        </button>
      )}
    </div>
  );
}
