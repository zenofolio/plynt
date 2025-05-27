import { getValueFromMetadata } from "../helpers/getValueFromMetadata";
import { normalizeFunctions } from "../helpers/normalizeFunctions";
import { ParsedTemplate } from "./ParsedTemplate";
import {
  ParsedToken,
  TemplateEngineOptions,
  TransformFn,
} from "../types/template.types";
import { tokenizeTemplate } from "../tokenizers/template.tokenizer";

const DEDAULT_PATTERN =
  /<<@(?:(?<namespace>[a-zA-Z_$][\w$]*)\:)?(?<key>[a-zA-Z_$][\w$]*)(?:->(?<fnChain>[a-zA-Z_$][\w$]*(?:->[a-zA-Z_$][\w$]*)*))?@>>(?:\[\((?<fallback>[^\)]*?)\)\])?/g;

/**
 * TemplateEngine es el núcleo de Plynt.
 * Permite analizar, compilar y renderizar plantillas con transformaciones encadenadas, asincrónicas y cacheadas.
 */
export class TemplateEngine {
  private functions: Map<string, TransformFn>;
  private pattern: RegExp;
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

    this.pattern = options?.pattern || DEDAULT_PATTERN;

    this.options = options || {};
  }

  /**
   * Registra una nueva función de transformación
   */
  public addFunction(name: string, fn: TransformFn): void {
    this.functions.set(name, fn);
  }

  /**
   * Analiza la plantilla y retorna sus tokens como estructura reutilizable
   */
  public parse(template: string): ParsedTemplate {

    const tokens: ParsedToken[] = tokenizeTemplate(template);

    return new ParsedTemplate(template, tokens);
  }

  /**
   * Devuelve una función de renderizado asíncrona lista para usar con metadata
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
   * Renderiza directamente la plantilla con metadata
   */
  public async render(
    template: string,
    metadata: Record<string, any>
  ): Promise<string> {
    return this.build(template)(metadata);
  }

  /**
   * Precompila la plantilla para render rápido y `.to()` reutilizable
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
