import { describe, it, expect } from "vitest";
import { TemplateEngine } from "../src/core/TemplateEngine";
import { mediumTemplate } from "./helpers/templates";

const templateEngine = new TemplateEngine();

// Funciones personalizadas
templateEngine.addFunction("test", async (val) => `Test: ${val}`);
templateEngine.addFunction("trim", async (val) => `${val}`.trim());

// Plantilla de prueba
const template =
  "Hello <<@user:name->trim@>>[( Randy )], <<@test:value->test@>>!";

describe("TemplateEngine - Simple Cases", () => {
  it("should parse a single token", () => {
    const parsed = templateEngine.parse(template);

    expect(parsed.tokens.length).toBe(2);
    expect(parsed.tokens[0].path).toBe("user.name");
    expect(parsed.tokens[0].key).toBe("name");
  });

  it("should render a token using a custom function", async () => {
    const render = templateEngine.build(template);

    const result = await render({
      "user.name": "Randy",
      "test.value": "world",
    });

    expect(result).toBe("Hello Randy, Test: world!");
  });

  it("multiple functions should apply in order", async () => {
    const templateWithFunctions = "Hello <<@user:name->trim->test@>>!";
    const render = templateEngine.build(templateWithFunctions);

    const result = await render({
      "user.name": "  Randy  ",
    });

    expect(result).toBe("Hello Test: Randy!");
  });

  it("large template with multiple tokens", async () => {
    const { metadata, template } = mediumTemplate;

    const render = templateEngine.build(template);
    const result = await render(metadata);
    expect(result).contain("Hola Randy,");
  });

  // it("Handle multiple fields in the same namespace", async () => {
  //   const templateWithMultipleFields = "Hello <<@user:name|username->trim@>> and <<@user:age->trim@>>!";
  //   const render = templateEngine.build(templateWithMultipleFields);

  //   const result = await render({
  //     "user.username": "  Randy  ",
  //     "user.age": "  30  ",
  //   });

  //   console.log(result);

  //   expect(result).toBe("Hello Randy and 30!");
  // })
});
