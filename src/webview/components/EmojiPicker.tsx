import { useState, useRef, useEffect } from 'react';

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: 'Smileys',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉',
      '😊', '😇', '🥰', '😍', '🤩', '😎', '🤓', '🧐', '🤔', '😏',
      '🫡', '🤗', '🫠', '😶', '🙄', '😬', '🤥', '😌', '😴', '🥳',
    ],
  },
  {
    label: 'Hands & People',
    emojis: [
      '👋', '👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '🫶', '💪',
      '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🔬', '🧑‍🎨', '🧑‍🚀', '🥷', '🦸', '🧙', '👻',
    ],
  },
  {
    label: 'Animals & Nature',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵',
      '🐔', '🐧', '🐦', '🦅', '🦉', '🐝', '🐛', '🦋', '🐌', '🐙',
      '🌲', '🌴', '🌵', '🍀', '🌸', '🌻', '🌈', '⭐', '🌙', '☀️',
    ],
  },
  {
    label: 'Food & Drink',
    emojis: [
      '🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🍑', '🥑', '🌶️', '🍕',
      '🍔', '🌮', '🍜', '🍣', '🧁', '🍰', '🍩', '☕', '🍵', '🧋',
    ],
  },
  {
    label: 'Objects & Tools',
    emojis: [
      '💻', '🖥️', '⌨️', '🖱️', '💾', '📱', '📟', '🔧', '🔨', '⚙️',
      '🔬', '🔭', '💡', '🔑', '🔒', '📦', '📁', '📂', '📝', '📌',
      '📎', '✏️', '🖊️', '📐', '📏', '🗂️', '📋', '📊', '📈', '📉',
    ],
  },
  {
    label: 'Symbols & Travel',
    emojis: [
      '🚀', '✈️', '🚗', '🚢', '🏠', '🏢', '🏗️', '⚡', '🔥', '💧',
      '🎯', '🏆', '🎮', '🎲', '🎨', '🎵', '🎬', '💎', '🧲', '🧪',
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '✅', '❌',
      '⚠️', '🚩', '🏁', '♻️', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣',
    ],
  },
];

const ALL_EMOJIS = EMOJI_GROUPS.flatMap((g) => g.emojis);

interface EmojiPickerProps {
  currentEmoji: string | null;
  onSelect: (emoji: string | null) => void;
  onClose: () => void;
}

export function EmojiPicker({ currentEmoji, onSelect, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // For search, we just filter the flat list (emoji characters contain themselves)
  const filtered = search
    ? ALL_EMOJIS.filter((e) => e.includes(search))
    : null;

  return (
    <div className="icon-picker" ref={ref} onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        className="icon-picker__search"
        type="text"
        placeholder="Type emoji to filter..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {currentEmoji && (
        <button
          className="icon-picker__reset"
          onClick={() => onSelect(null)}
        >
          <span className="codicon codicon-discard" /> Clear emoji
        </button>
      )}
      <div className="emoji-picker__scroll">
        {filtered ? (
          <div className="icon-picker__grid icon-picker__grid--emoji">
            {filtered.map((emoji, i) => (
              <button
                key={i}
                className={`icon-picker__item icon-picker__item--emoji ${currentEmoji === emoji ? 'icon-picker__item--selected' : ''}`}
                onClick={() => onSelect(emoji)}
              >
                {emoji}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="icon-picker__empty">No matching emoji</div>
            )}
          </div>
        ) : (
          EMOJI_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="emoji-picker__group-label">{group.label}</div>
              <div className="icon-picker__grid icon-picker__grid--emoji">
                {group.emojis.map((emoji, i) => (
                  <button
                    key={i}
                    className={`icon-picker__item icon-picker__item--emoji ${currentEmoji === emoji ? 'icon-picker__item--selected' : ''}`}
                    onClick={() => onSelect(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
