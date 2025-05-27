import { ParsedToken } from "../types/template.types";

/**
 * ParsedTemplate representa el resultado del análisis de una plantilla Plynt.
 * Permite reutilizar los tokens detectados y transformarlos con `.to()`.
 */
export class ParsedTemplate {
  constructor(
    public readonly template: string,
    public readonly tokens: ParsedToken[]
  ) {}

  /**
   * Transforma la plantilla original a otro formato usando un callback.
   *
   * @example
   * parsed.to((key, path) => `{{${path}}}`)
   */
  public to(replacer: (token: ParsedToken) => string): string {
    let result = this.template;

    for (const token of this.tokens) {
      const replacement = replacer(token);
      result = result.replace(token.raw, replacement);
    }

    return result;
  }
}
