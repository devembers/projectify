/**
 * Simple glob matcher for exclude patterns.
 * Supports * and ? wildcards. For our use case, patterns are simple
 * basename matches like "node_modules", ".git", etc.
 */
export function minimatch(name: string, pattern: string): boolean {
  // Exact match
  if (name === pattern) {
    return true;
  }

  // Simple wildcard conversion to regex
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');

  try {
    return new RegExp(`^${escaped}$`).test(name);
  } catch {
    return name === pattern;
  }
}
