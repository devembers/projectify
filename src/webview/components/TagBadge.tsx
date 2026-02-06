import type { Tag } from '../../types.js';

const DEFAULT_COLORS = [
  '#4fc1ff', '#4ec9b0', '#ce9178', '#c586c0',
  '#dcdcaa', '#d7ba7d', '#9cdcfe', '#569cd6',
];

interface TagBadgeProps {
  tag: Tag;
  allTags: Tag[];
}

export function TagBadge({ tag, allTags }: TagBadgeProps) {
  const color = tag.color ?? getDefaultColor(tag.name, allTags);
  return (
    <span
      className="tag-badge"
      style={{
        backgroundColor: `${color}22`,
        color: color,
        border: `1px solid ${color}44`,
      }}
    >
      {tag.name}
    </span>
  );
}

/** Simple name-based tag badge when we just have a name string, not a Tag object. */
export function TagBadgeByName({ name, allTags }: { name: string; allTags: Tag[] }) {
  const tag = allTags.find((t) => t.name === name);
  const color = tag?.color ?? getDefaultColor(name, allTags);
  return (
    <span
      className="tag-badge"
      style={{
        backgroundColor: `${color}22`,
        color: color,
        border: `1px solid ${color}44`,
      }}
    >
      {name}
    </span>
  );
}

function getDefaultColor(name: string, allTags: Tag[]): string {
  // Use tag's index for consistent default color
  const idx = allTags.findIndex((t) => t.name === name);
  return DEFAULT_COLORS[(idx >= 0 ? idx : hashStr(name)) % DEFAULT_COLORS.length];
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
