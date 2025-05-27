# @zenofolio/plynt

Welcome to the monorepo for `@zenofolio/plynt`, a powerful and extensible template engine designed for dynamic text rendering at scale.

---

## 📦 Packages


| Package               | Description                                      |
|-----------------------|--------------------------------------------------|
| `core`                | Main template engine logic (parsing, rendering)  |
| `examples`            | Working examples and integration scenarios       |

---

## 🚀 Features at a Glance

- Chained async functions (e.g., `->trim->capitalize`)
- Multiple fallback keys (`<<@user:name|username@>>`)
- Function parameters (`->truncate(10, "...")`)
- Optional fallback values per token (`[(Fallback)]`)
- Designed for messaging, campaigns, and live systems

---

## 📁 Directory Structure

```bash
@zenofolio/plynt/
├── packages/
│   ├── core/                # TemplateEngine logic
│   └── examples/            # Real-world use cases
├── README.md
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 📜 Usage

See [packages/core/README.md](./packages/core/README.md) for how to use the template engine.

---

## 📈 Benchmarks

To run performance benchmarks:

```bash
pnpm vitest bench
```

---
 
---

## 🪪 License

MIT