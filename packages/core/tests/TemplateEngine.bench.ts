import { bench } from "vitest";
import { TemplateEngine } from "../src/core/TemplateEngine";
import { mediumTemplate } from "./helpers/templates";

// Instancia del motor con cache
const templateEngine = new TemplateEngine();

// Funciones de transformación
templateEngine.addFunction("test", async (val) => `Test: ${val}`);
templateEngine.addFunction("trim", async (val) => `${val}`.trim());

const { template, metadata } = mediumTemplate;

// 🧪 Render compilado con cache
const render = templateEngine.build(template);

// Benchmark: 100,000 renderizados
bench("TemplateEngineMap.render() x100000", async () => {
  for (let i = 0; i < 100_000; i++) {
    await render(metadata);
  }
});
