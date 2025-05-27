/**
 * Parses a raw pipeline string like:
 *   "trim|padStart:4,\"0\"|slug"
 *
 * into a normalized list of function calls with arguments:
 * This is used by the TemplateEngine to prepare the execution sequence.
 * @example
 * [
 *   { name: "trim", args: [] },
 *   { name: "padStart", args: ["4", "\"0\""] },
 *   { name: "slug", args: [] }
 * ]
 *
 */
export function normalizeFunctions(rawFns?: string): {
  name: string;
  args: string[];
}[] {
  if (!rawFns) return [];

  return rawFns.split("|").map((fn) => {
    const [name, ...argStr] = fn.split(":");
    const args = argStr
      .join(":")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return { name, args };
  });
}
