export interface ParsedFunction {
  name: string;
  args: string[];
}

/**
 * Una función de transformación puede ser síncrona o asíncrona,
 * y recibe una cadena base y argumentos opcionales.
 */
export type TransformFn = (
  input: string,
  ...args: string[]
) => Promise<string> | string;

/**
 * Token extraído de la plantilla mediante `parse()`.
 */
export interface ParsedToken {
  namespace?: string;
  raw: string;
  key: string;
  path: string;
  start: number;
  end: number;
  fallback?: string;
  functions: ParsedFunction[];
}

/**
 * Opciones de inicialización para TemplateEngine.
 */
export interface TemplateEngineOptions {
  strict?: boolean;
  fallbackValue?: string;
  pattern?: RegExp;
  functions?: Record<string, TransformFn>;
  onError?: (
    error: Error,
    ctx: { key: string; path: string; fn?: string }
  ) => void;
}
