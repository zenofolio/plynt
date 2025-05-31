/**
 * Represents a function used in a template token, along with its parsed arguments.
 *
 * Functions are parsed from tokens using the `->fnName(arg1, arg2)` syntax,
 * and applied in order during rendering.
 *
 * @example
 * // From: <<@user:name->wrap("[", "]")->trim@>>
 * {
 *   name: "wrap",
 *   args: ["[", "]"]
 * }
 */
export interface ParsedFunction {
  /**
   * The name of the transformation function to apply.
   */
  name: string;

  /**
   * A list of arguments passed to the function, parsed as strings.
   */
  args: string[];
}

/**
 * A transformation function used within a template token.
 *
 * It can be synchronous or asynchronous, and receives:
 * - The current string value (input)
 * - Any optional arguments passed via the template
 *
 * The return value is either a transformed string or a Promise of one.
 *
 * @example
 * const trim: TransformFn = (input) => input.trim();
 *
 * const wrap: TransformFn = (input, left, right) => `${left}${input}${right}`;
 */
export type TransformFn = (
  input: string,
  ...args: string[]
) => Promise<string | number | object> | (string | number | object);

/**
 * Represents a single token extracted from a template via `parse()`.
 *
 * A token includes its original string, positional data,
 * resolved path, fallback value, and any transformation functions.
 */
export interface ParsedToken {
  /**
   * Optional namespace of the token, used to group or scope the key (e.g., "user").
   */
  namespace?: string;

  /**
   * Full raw token string, including delimiters and transformations.
   */
  raw: string;

  /**
   * The direct key name inside the namespace or global context.
   */
  key: string;

  /**
   * Resolved full path in dot notation (e.g., "user.name").
   */
  path: string;

  /**
   * Position where the token starts in the original template string.
   */
  start: number;

  /**
   * Position where the token ends in the original template string.
   */
  end: number;

  /**
   * Optional fallback value to use if no value is found at the path.
   */
  fallback?: string;

  /**
   * List of transformation functions to apply in order.
   */
  functions: ParsedFunction[];
}

/**
 * Configuration options for initializing the TemplateEngine.
 *
 * These options allow you to control parsing behavior, fallback logic,
 * custom functions, error handling, and token wrappers.
 */
export interface TemplateEngineOptions {
  /**
   * Enables strict mode. If true, missing keys or unknown functions
   * will throw an error instead of silently failing.
   */
  strict?: boolean;

  /**
   * Default value to use when a token's value is missing and no fallback is provided.
   */
  fallbackValue?: string;

  /**
   * A map of custom transformation functions that can be used in the template.
   * Each function can be async and may accept additional arguments.
   */
  functions?: Record<string, TransformFn>;

  /**
   * Optional custom delimiters for token wrappers (default: <<@ ... @>>).
   */
  wrapper?: {
    /**
     * Start delimiter (default: "<<@").
     */
    start?: string;

    /**
     * End delimiter (default: "@>>").
     */
    end?: string;
  };


  failbackPartner?: RegExp;

  /**
   * Error handler callback for missing keys, failed functions,
   * or any other parsing/rendering issue.
   */
  onError?: (
    error: Error,
    ctx: {
      key: string;
      path: string;
      fn?: string;
    }
  ) => void;
}
