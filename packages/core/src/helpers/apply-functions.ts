import { PlyntEngine } from "../core/PlyntEngine";
import { ParsedToken } from "../types/template.types";

/**
 * Applies a sequence of functions to a token's fallback value using a PlyntEngine.
 *
 * @param engine - The function engine that provides available function definitions
 * @param token - The parsed token containing the fallback value and functions
 * @param cache - Optional cache map to avoid recomputation for the same token
 * @param onError - Optional error callback handler
 * @returns A Promise that resolves to the final transformed string
 */
export default async function applyFunctions(
  engine: PlyntEngine,
  token: ParsedToken,
  cache: Map<string, any> = new Map(),
  onError: (error: Error, token: ParsedToken) => void = () => {}
): Promise<string> {
  // If there are no functions to apply, return the fallback value directly
  if (!token.functions || token.functions.length === 0) {
    return token.fallback || "";
  }

  // Return cached result if already computed
  if (cache.has(token.raw)) {
    return cache.get(token.raw);
  }

  let value = token.fallback;

  // Sequentially apply all functions to the value
  for (const fn of token.functions) {
    const $function = engine.getFunction(fn.name);

    if (!$function) {
      // Gracefully handle unknown functions
      onError(new Error(`Unknown function: ${fn.name}`), token);
      continue;
    }

    try {
      value = await $function(value, ...fn.args);
    } catch (err: any) {
      // Handle errors in function execution
      onError(err instanceof Error ? err : new Error(String(err)), token);
    }
  }

  // Cache and return the final result
  cache.set(token.raw, value);
  return value;
}
