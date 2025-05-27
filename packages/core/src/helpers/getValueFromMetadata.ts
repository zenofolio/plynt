/**
 * Resolves a nested value from an object using dot notation.
 *
 * First checks if the full path exists as a direct key. If not, traverses using dot notation.
 *
 * @example
 * const data = {
 *   "user.name.first": "Direct",
 *   user: { name: { first: "Nested" } }
 * };
 * getValueFromMetadata("user.name.first", data); // → "Direct"
 *
 * Returns `undefined` if the key or path does not exist.
 */
export function getValueFromMetadata(
  path: string,
  metadata: Record<string, any>
): any {
  if (!path || typeof metadata !== "object") return undefined;

  if (path in metadata) return metadata[path];

  const segments = path.split(".");
  let current: any = metadata;

  for (const segment of segments) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[segment];
  }

  return current;
}
