import { useState, useMemo, useRef } from 'react';

interface GroupInputProps {
  value: string;
  onChange: (value: string) => void;
  existingGroups: string[];
  className?: string;
  placeholder?: string;
}

export function GroupInput({ value, onChange, existingGroups, className, placeholder }: GroupInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredGroups = useMemo(() => {
    if (!value.trim()) return existingGroups;
    const lower = value.toLowerCase();
    return existingGroups.filter(
      (g) => g.toLowerCase().includes(lower) && g.toLowerCase() !== lower,
    );
  }, [value, existingGroups]);

  const showSuggestions = focused && filteredGroups.length > 0;

  return (
    <div className="group-input">
      <input
        ref={inputRef}
        className={className}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />
      {showSuggestions && (
        <div className="group-input__suggestions">
          {filteredGroups.map((g) => (
            <button
              key={g}
              className="group-input__suggestion"
              onMouseDown={() => {
                onChange(g);
                inputRef.current?.blur();
              }}
            >
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
