import { describe, it, expect } from "vitest";
import { PlyntEngine } from "../src/core/PlyntEngine";
import { mediumTemplate } from "./helpers/templates";

const templateEngine = new PlyntEngine();

// Funciones personalizadas
templateEngine.addFunction("test", async (val) => `Test: ${val}`);
templateEngine.addFunction("trim", async (val) => `${val}`.trim());
templateEngine.addFunction("upper", async (val) => `${val}`.toUpperCase());
templateEngine.addFunction("attach", async (val, e) => `Attached: ${val} ${e}`);
templateEngine.addFunction("company", async (val, e) => `Automatizado VIP`);

templateEngine.addFunction("number", async (val) => {
  const parsed = Number(val);
  if (isNaN(parsed)) {
    throw new Error(`Cannot convert "${val}" to integer`);
  }
  return parsed;
});

templateEngine.addFunction("nullable", async (val) => {
  if (val === null || val === undefined || val === "") {
    return null;
  }
  return val;
});

// Plantilla de prueba
const template =
  "Hello <<@user:name->trim@>>[( John )], <<@test:value->test@>>!";

describe("TemplateEngine - Simple Cases", () => {
  it("should parse a single token", () => {
    const template = "<<@user:name->trim->upper@>>[(John)]";
    const parsed = templateEngine.parse(template);

    expect(parsed.tokens.length).toBe(1);
    expect(parsed.tokens[0].path).toBe("user.name");
  });

  it("should render a token using a custom function", async () => {
    const render = templateEngine.build(template);

    const result = await render({
      user: {
        name: "  John  ",
      },
      "test.value": "world",
    });

    expect(result).toBe("Hello John, Test: world!");
  });

  it("use as extractor", async () => {
    const templateWithExtractor = `
      <<@user:name@>>[(John)] 
      <<@user:last@>>[(Doe)]
      <<@user:address.city@>>[(Santiago)]
    `;

    const metadata = await templateEngine.metadata(templateWithExtractor);

    expect(metadata).toEqual({
      user: {
        name: "John",
        last: "Doe",
        address: {
          city: "Santiago",
        },
      },
    });
  });

  it("multiple functions should apply in order", async () => {
    const templateWithFunctions = "Hello <<@user:name->trim->test@>>!";
    const render = templateEngine.build(templateWithFunctions);

    const result = await render({
      "user.name": "  John  ",
    });

    expect(result).toBe("Hello Test: John!");
  });

  it("large template with multiple tokens", async () => {
    templateEngine.addFunction("formatCurrency", async (val) => {
      return `USD ${parseFloat(val).toFixed(2)}`;
    });

    templateEngine.addFunction("formatDate", async (val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${val}`);
      }
      return date.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    });

    const { metadata, template } = mediumTemplate;

    const render = templateEngine.build(template);
    const result = await render(metadata);
    expect(result).contain("Hello Jhon");
  });

  it("custom wrappers function", async () => {
    const engine = new PlyntEngine({
      wrapper: {
        start: "[[@",
        end: "@]]",
      },
      failbackPartner: /^\[\((.*?)\)\]/,
    });

    const template = `[[@client:name@]][(John Doe)] [[@client:email@]]`;
    const result = await engine.render(template, {
      client: {
        email: "example@gmail.com",
      },
    });

    expect(result).toBe("John Doe example@gmail.com");
  });
});
