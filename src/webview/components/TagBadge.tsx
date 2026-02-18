import type { Tag } from '../../types.js';
import { useTheme, getDefaultColors, getTagBadgeStyle } from '../utils/themeUtils.js';

interface TagBadgeProps {
  tag: Tag;
  allTags: Tag[];
}

export function TagBadge({ tag, allTags }: TagBadgeProps) {
  const themeKind = useTheme();
  const color = tag.color ?? getDefaultColor(tag.name, allTags, themeKind);
  return (
    <span className="tag-badge" style={getTagBadgeStyle(color, themeKind)}>
      {tag.name}
    </span>
  );
}

/** Simple name-based tag badge when we just have a name string, not a Tag object. */
export function TagBadgeByName({ name, allTags }: { name: string; allTags: Tag[] }) {
  const themeKind = useTheme();
  const tag = allTags.find((t) => t.name === name);
  const color = tag?.color ?? getDefaultColor(name, allTags, themeKind);
  return (
    <span className="tag-badge" style={getTagBadgeStyle(color, themeKind)}>
      {name}
    </span>
  );
}

function getDefaultColor(name: string, allTags: Tag[], themeKind: Parameters<typeof getDefaultColors>[0]): string {
  const colors = getDefaultColors(themeKind);
  const idx = allTags.findIndex((t) => t.name === name);
  return colors[(idx >= 0 ? idx : hashStr(name)) % colors.length];
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
