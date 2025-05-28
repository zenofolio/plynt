import { getValueFromMetadata } from "../helpers/get-value-from-metadata.helper";
import { ParsedTemplate } from "./ParsedTemplate";
import {
  ParsedToken,
  TemplateEngineOptions,
  TransformFn,
} from "../types/template.types";
import { tokenizeTemplate } from "../tokenizers/template.tokenizer";

/**
 * PlyntEngine is a flexible and async-friendly template processor
 * designed to parse and render dynamic strings using metadata.
 *
 * It supports:
 * - Custom transformation functions (async or sync)
 * - Strict mode for key validation
 * - Fallback values for missing data
 * - Advanced token parsing with chaining and arguments
 *
 * @example Basic usage:
 *
 * ```ts
 * import { PlyntEngine } from "@plynt/core";
 *
 * const engine = new PlyntEngine({
 *   functions: {
 *     capitalize: async (val) =>
 *       val.charAt(0).toUpperCase() + val.slice(1).toLowerCase(),
 *   },
 *   strict: true,
 *   fallbackValue: "N/A",
 *   onError: (error, context) => {
 *     console.error("Error rendering template:", error, context);
 *   },
 * });
 *
 * const template = "Hello, <<@user:name->capitalize@>>!";
 *
 * const metadata = {
 *   user: {
 *     name: "john doe",
 *   },
 * };
 *
 * const rendered = await engine.render(template, metadata);
 * console.log(rendered); // "Hello, John doe!"
 * ```
 */

export class PlyntEngine {
  private functions: Map<string, TransformFn>;
  private options: TemplateEngineOptions;

  constructor(options?: TemplateEngineOptions) {
    this.functions = new Map(
      Object.entries({
        trim: async (val) => val.trim(),
        capitalize: async (val) =>
          val.charAt(0).toUpperCase() + val.slice(1).toLowerCase(),
        lower: async (val) => val.toLowerCase(),
        upper: async (val) => val.toUpperCase(),
        ...(options?.functions || {}),
      })
    );

    this.options = options || {};
  }

  /**
   * Adds a custom transformation function to the engine.
   *
   * @param name
   * @param fn
   */
  public addFunction(name: string, fn: TransformFn): void {
    this.functions.set(name, fn);
  }

  /**
   * Retrieves a transformation function by name.
   *
   * @param name
   * @returns
   */
  public getFunction(name: string): TransformFn | undefined {
    return this.functions.get(name);
  }

  /**
   * Parses a template string into a structured format.
   *
   * @param template
   * @returns
   */
  public parse(template: string): ParsedTemplate {
    const tokens: ParsedToken[] = tokenizeTemplate(
      template,
      this.options.wrapper
    );

    return new ParsedTemplate(template, tokens);
  }

  /**
   * Builds a function that can render the template with provided metadata.
   * This function is optimized for performance by caching results of previous token replacements.
   *
   * @param template The template string to build the rendering function for.
   * @returns A function that takes metadata and returns a rendered string.
   */
  public build(
    template: string
  ): (metadata: Record<string, any>) => Promise<string> {
    const parsed = this.parse(template);

    return async (metadata) => {
      let result = template;
      const cache = new Map<string, string>();

      for (const token of parsed.tokens) {
        if (cache.has(token.raw)) {
          result = result.replace(token.raw, cache.get(token.raw)!);
          continue;
        }

        let value: string;
        try {
          const rawVal = getValueFromMetadata(token.path, metadata);
          if (rawVal == null || rawVal === undefined) {
            if (token.fallback !== undefined) {
              value = token.fallback;
            } else if (this.options.strict) {
              throw new Error(`Missing key: ${token.path}`);
            } else {
              value = this.options.fallbackValue ?? "";
            }
          } else {
            value = typeof rawVal === "string" ? rawVal : String(rawVal);
          }

          for (const fn of token.functions) {
            const transform = this.functions.get(fn.name);
            if (!transform) {
              if (this.options.strict)
                throw new Error(`Unknown function: ${fn.name}`);
              this.options.onError?.(
                new Error(`Unknown function: ${fn.name}`),
                { key: token.key, path: token.path, fn: fn.name }
              );
              continue;
            }

            value = await transform(value, ...fn.args);
          }
        } catch (err: any) {
          this.options.onError?.(err, { key: token.key, path: token.path });
          value = this.options.fallbackValue ?? "";
        }

        cache.set(token.raw, value);
        result = result.replace(token.raw, value);
      }

      return result;
    };
  }

  /**
   * Renders a template string using the provided metadata.
   *
   * @param template
   * @param metadata
   * @returns
   */
  public async render(
    template: string,
    metadata: Record<string, any>
  ): Promise<string> {
    return this.build(template)(metadata);
  }

  /**
   * Converts a template string into a string using a replacer function.
   *
   * This method parses the template and replaces each token with the result of the replacer function.
   *
   * @example
   * ```ts
   * const engine = new PlyntEngine();
   * const template = "Hello, <<@user:name->capitalize@>>!";
   * const replacer = ({path}: ParsedToken) => `{{${path}}}`
   * engine.to(template, replacer); // "Hello, {{user.name}}!"
   * ```
   *
   */
  to(template: string, replacer: (token: ParsedToken) => string): string {
    const parsed = this.parse(template);
    return parsed.to(replacer);
  }

  /**
   * Compiles a template into a render function.
   * This allows for efficient rendering of the same template with different data.
   *
   * @param template The template string to compile.
   * @returns An object containing the render function and a method to convert tokens to strings.
   */

  public compile(template: string): {
    render: (data: Record<string, any>) => Promise<string>;
    to: ParsedTemplate["to"];
  } {
    const parsed = this.parse(template);
    const buildFn = this.build(template);
    return {
      render: buildFn,
      to: parsed.to.bind(parsed),
    };
  }
}
