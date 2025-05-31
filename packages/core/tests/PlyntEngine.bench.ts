import { bench } from "vitest";
import { PlyntEngine } from "../src/core/PlyntEngine";
import { mediumTemplate } from "./helpers/templates";

// Instancia del motor con cache
const engine = new PlyntEngine();

// Funciones de transformación
engine.addFunction("test", async (val) => `Test: ${val}`);
engine.addFunction("trim", async (val) => `${val}`.trim());

const { template, metadata } = mediumTemplate;

// 🧪 Render compilado con cache
const render = engine.build(template);

// Benchmark: 100,000 renderizados
bench("PlyntEngine.render() x100000", async () => {
  for (let i = 0; i < 100_000; i++) {
    await render(metadata);
  }
});
