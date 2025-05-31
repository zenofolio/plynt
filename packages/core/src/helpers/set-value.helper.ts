/**
 * Sets a value in a nested object using a dot-separated path.
 *
 * @param data - The object to modify
 * @param path - Dot-separated path string (e.g., "a.b.c")
 * @param value - The value to set at the target path
 */
export const setValue = (
  data: Record<string, any>,
  path: string,
  value: any
): void => {
  // Validate input: data must be an object and path must be non-empty
  if (!path || typeof data !== "object" || data === null) return;

  // Fast split of path into keys
  const segments = path.split(".");
  const lastIndex = segments.length - 1;
  let current = data;

  for (let i = 0; i < lastIndex; i++) {
    const key = segments[i];

    // Only create an object if the key doesn't exist or isn't an object
    const next = current[key];
    if (typeof next !== "object" || next === null) {
      current[key] = {};
    }

    current = current[key];
  }

  // Set the final value
  current[segments[lastIndex]] = value;
};
