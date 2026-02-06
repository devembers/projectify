import { useState, useRef, useEffect } from 'react';

interface EditDialogProps {
  initialValue: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export function EditDialog({ initialValue, onConfirm, onCancel, placeholder }: EditDialogProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed) {
        onConfirm(trimmed);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      className="project-card__name-input"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={onCancel}
      placeholder={placeholder}
    />
  );
}
