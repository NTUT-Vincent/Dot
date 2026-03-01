# Dot

**Dot** is a React widget that lets you drop an AI-powered analytics panel into any web app. The user can type a natural-language question, and Dot renders an interactive dashboard — charts, tables, and KPIs — without you writing a single dashboard spec by hand.

---

## Features

- 💬 **Chat interface** – ask questions about your data in plain English.
- 📊 **Highcharts** – bar and line charts rendered with [Highcharts](https://www.highcharts.com/).
- 📋 **AG Grid** – sortable, filterable data tables powered by [AG Grid](https://www.ag-grid.com/).
- 🔢 **KPI cards** – quick numeric summaries.
- 📝 **Markdown blocks** – freeform text alongside your data.
- 🔌 **Bring-your-own LLM** – plug in any backend that implements `DotLLMClient`.

---

## Installation

```bash
npm install dot highcharts highcharts-react-official ag-grid-react ag-grid-community
```

Dot has peer dependencies on `react` and `react-dom` ≥ 17.

---

## Quick Start

### Using the Google Gemini API

Install the Gemini SDK alongside Dot:

```bash
npm install dot @google/generative-ai
```

Then wire it up with the built-in `createGeminiClient` helper:

```tsx
import React from "react";
import { Dot, DotProvider, createGeminiClient } from "dot";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Create the Gemini-backed LLM client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const llmClient = createGeminiClient(genAI, { model: "gemini-1.5-flash" });

// 2. Wrap your app with DotProvider
export function App() {
  const data = { sales: [...], users: [...] };

  return (
    <DotProvider appDescription="Sales analytics app" llmClient={llmClient}>
      <YourApp />
      {/* 3. Drop <Dot> wherever you want the floating button */}
      <Dot data={data} />
    </DotProvider>
  );
}
```

### Using a custom / proxy backend

Use the built-in `createCustomClient` helper to call any LLM — OpenAI,
Anthropic, Ollama, or your own server-side proxy — by supplying a single
`generate` callback that returns the raw dashboard-spec JSON text:

```tsx
import { createCustomClient, DotProvider, Dot } from "dot";

const llmClient = createCustomClient(async (messages) => {
  const response = await fetch("/api/ai/dashboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const { jsonText } = await response.json();
  return jsonText;
});

export function App() {
  return (
    <DotProvider appDescription="My app" llmClient={llmClient}>
      <YourApp />
      <Dot data={data} />
    </DotProvider>
  );
}
```

You can also implement the `DotLLMClient` interface directly if you need full
control:

```tsx
import type { DotLLMClient } from "dot";

const myLLMClient: DotLLMClient = {
  async generateDashboard({ messages }) {
    const response = await fetch("/api/ai/dashboard", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });
    const { jsonText } = await response.json();
    return { jsonText };
  },
};
```

Clicking the floating button opens a side panel with a chat input and a live dashboard.

---

## API

### `<DotProvider>`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `appDescription` | `string` | ✅ | One-sentence description sent to the LLM as context. |
| `llmClient` | `DotLLMClient` | ✅ | Object with a `generateDashboard` method. |
| `options` | `DotOptions` | | Fine-tune data limits (see below). |

### `<Dot>`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `DotData` | ✅ | Plain JS object — your app's data passed to the LLM. |

### `DotLLMClient`

```ts
interface DotLLMClient {
  generateDashboard(args: { messages: ChatMessage[] }): Promise<{ jsonText: string }>;
}
```

### `createGeminiClient(genAI, options?)`

Built-in helper that wraps a `GoogleGenerativeAI` instance as a `DotLLMClient`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `genAI` | `GoogleGenerativeAI` | — | Gemini client from `@google/generative-ai`. |
| `options.model` | `string` | `"gemini-1.5-flash"` | Gemini model name to use. |

### `createCustomClient(generate)`

Built-in helper that wraps any `generate` callback as a `DotLLMClient`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `generate` | `(messages: ChatMessage[]) => Promise<string>` | A function that calls your LLM and returns the raw dashboard-spec JSON string. |

### `DotOptions`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `maxBytes` | `number` | `40000` | Maximum JSON size of `data` sent to the LLM. |
| `maxRows` | `number` | `200` | Maximum rows per table widget. |
| `maxWidgets` | `number` | `8` | Maximum widgets per dashboard. |

---

## Dashboard Widget Types

The LLM returns a `DashboardSpec` JSON object. Supported widget types:

| Type | Description |
|------|-------------|
| `kpi` | Row of numeric KPI cards. |
| `bar` | Bar chart (Highcharts). |
| `line` | Line chart (Highcharts). |
| `table` | Data table with sorting & filtering (AG Grid). |
| `markdown` | Freeform text / notes. |

---

## Development

```bash
# Install all workspace dependencies
npm install

# Run tests
npm test

# Lint
npm run lint

# Build
npm run build
```

---

## License

MIT
