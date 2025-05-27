function tokenizeArgs(argStr: string): string[] {
  const args: string[] = [];
  let current = "";
  let inString = false;
  let quoteType = "";

  for (let i = 0; i < argStr.length; i++) {
    const char = argStr[i];

    if ((char === '"' || char === "'")) {
      if (!inString) {
        inString = true;
        quoteType = char;
        continue;
      } else if (quoteType === char && argStr[i - 1] !== "\\") {
        inString = false;
        continue;
      }
    }

    if (char === "," && !inString) {
      args.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) args.push(current.trim());
  return args;
}
