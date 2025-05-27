# @zenofolio/plynt

**Plynt** is a lightweight and powerful template engine designed for dynamic text rendering — perfect for messaging, campaign systems, and real-time content personalization.

---

## 🚀 Features

- ✅ Supports **chained functions**: `->trim->capitalize`
- ✅ Handles **async functions** seamlessly
- ✅ Allows **function parameters**: `->truncate(10, "...")`
- ✅ Built-in **fallback support** per token: `[( Default )]`
- ✅ Uses **namespace.key** syntax: `<<@user:name@>>`
- ✅ Supports **multi-key fallback**: `<<@user:name|username@>>`
- ✅ Compile and reuse templates with `build()` and `compile()`
- ✅ Fully text-based: no HTML, no DOM assumptions
- ✅ Designed for **high-performance mass rendering**

---

## 📦 Installation

```bash
npm install @zenofolio/plynt
```

---

## 🧩 Example

```txt
Hello <<@user:name->trim->capitalize@>>[( Guest )],
Your order <<@order:id@>> has been shipped.
```

With metadata:

```ts
{
  user: { name: "   randy" },
  order: { id: "#123456" }
}
```

Output:

```
Hello Randy,
Your order #123456 has been shipped.
```

---

## ✨ Supported Syntax

### Tokens

```txt
<<@namespace:key->fn1->fn2@>>[( Fallback )]
```

### Examples

| Syntax                              | Description                           |
| ----------------------------------- | ------------------------------------- |
| `<<@user:name@>>`                   | Simple key lookup                     |
| `<<@user:name->trim@>>`             | Applies function to the value         |
| `<<@user:name->trim->capitalize@>>` | Chains multiple functions             |
| `<<@order:total->formatCurrency@>>` | Function with custom logic            |
| `<<@user:name@>>[(Guest)]`          | Provides fallback if value is missing |

---

## 🔧 Usage

```ts
import { TemplateEngine } from "@zenofolio/plynt";

const engine = new TemplateEngine();

engine.addFunction("trim", (val) => val.trim());
engine.addFunction(
  "capitalize",
  (val) => val.charAt(0).toUpperCase() + val.slice(1)
);

const template = "Hello <<@user:name->trim->capitalize@>>[( Guest )]";
const render = engine.build(template);

const output = await render({ user: { name: "   randy " } });
// → Hello Randy
```

---

## 📄 License

MIT — by [@zenofolio](https://github.com/zenofolio)
