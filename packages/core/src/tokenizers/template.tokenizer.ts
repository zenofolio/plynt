import { ParsedFunction, ParsedToken } from "../types/template.types";

export function tokenizeTemplate(input: string): ParsedToken[] {
  const tokens: ParsedToken[] = [];
  let cursor = 0;

  while ((cursor = input.indexOf("<<@", cursor)) !== -1) {
    const start = cursor;
    const endToken = input.indexOf("@>>", start);
    if (endToken === -1) break;

    const rawInner = input.slice(start + 3, endToken); // sin <<@ ni @>>
    const rawFull = input.slice(start, endToken + 3);

    // Buscar fallback opcional
    let fallback: string | undefined;
    let finalEnd = endToken + 3;

    const fallbackMatch = /^\[\((.*?)\)\]/.exec(input.slice(finalEnd));
    if (fallbackMatch) {
      fallback = fallbackMatch[1];
      finalEnd += fallbackMatch[0].length;
    }

    // Parse path y funciones
    const [pathPart, ...fnParts] = rawInner.split("->");
    const [namespace, key] = pathPart.includes(":")
      ? pathPart.split(":")
      : [undefined, pathPart];

    const functions: ParsedFunction[] = fnParts.map((fnRaw) => {
      const fnMatch = /^([a-zA-Z_$][\w$]*)(?:\((.*)\))?$/.exec(fnRaw.trim());
      if (!fnMatch) return { name: fnRaw.trim(), args: [] };

      const [, name, argString] = fnMatch;
      const args = argString ? tokenizeArgs(argString) : [];

      return { name, args };
    });

    tokens.push({
      namespace,
      raw: input.slice(start, finalEnd),
      key,
      path: namespace ? `${namespace}.${key}` : key,
      functions,
      fallback,
      start,
      end: finalEnd,
    });

    cursor = finalEnd;
  }

  return tokens;
}
