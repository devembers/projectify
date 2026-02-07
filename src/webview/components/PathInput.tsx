import { useState, useRef, useEffect, useCallback } from 'react';
import { postMessage, onMessage } from '../vscodeApi.js';

interface PathInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  onSubmit?: () => void;
}

export function PathInput({ value, onChange, className, placeholder, onSubmit }: PathInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const requestIdRef = useRef(0);

  // Listen for path completion responses
  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type === 'state:pathCompletions') {
        // Discard stale responses
        if (msg.requestId === requestIdRef.current) {
          setSuggestions(msg.suggestions);
          setHighlightIndex(-1);
        }
      }
    });
  }, []);

  const requestCompletions = useCallback((input: string) => {
    clearTimeout(debounceRef.current);
    if (!input) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const id = ++requestIdRef.current;
      postMessage({ type: 'action:completePath', input, requestId: id });
    }, 300);
  }, []);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    requestCompletions(newValue);
  };

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    setHighlightIndex(-1);
    // Request subdirectory completions immediately
    const id = ++requestIdRef.current;
    postMessage({ type: 'action:completePath', input: suggestion, requestId: id });
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
          selectSuggestion(suggestions[highlightIndex]);
        } else {
          onSubmit?.();
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSuggestions([]);
        setHighlightIndex(-1);
        return;
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit?.();
    }
  };

  const showSuggestions = focused && suggestions.length > 0;

  /** Extract the last directory name from a full path for display */
  const displayName = (fullPath: string) => {
    const trimmed = fullPath.replace(/\/+$/, '');
    return trimmed.split('/').pop() || fullPath;
  };

  return (
    <div className="path-input">
      <input
        ref={inputRef}
        className={className}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => { setFocused(false); setSuggestions([]); }, 150)}
      />
      {showSuggestions && (
        <div className="path-input__suggestions">
          {suggestions.map((s, i) => (
            <button
              key={s}
              className={`path-input__suggestion ${i === highlightIndex ? 'path-input__suggestion--highlighted' : ''}`}
              onMouseDown={() => selectSuggestion(s)}
            >
              <span className="codicon codicon-folder" />
              <span className="path-input__suggestion-text" title={s}>
                {displayName(s)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
