# Arabic Detail Typography Skill

Codex skill and local maintenance page for extracting layout-ready ecommerce copy and rendering transparent Arabic typography layers with local fonts.

## Contents

- `SKILL.md`: workflow and quality rules
- `scripts/render.mjs`: deterministic transparent PNG renderer and audit
- `layout-showcase.html`: editable browser maintenance page
- `ai-copy-server.mjs`: local structured-copy service
- `start-ai-layout.command`: local launcher for the maintenance page

## Use

Run the renderer with a JSON input:

```bash
node scripts/render.mjs input.json --out output-directory
```

For the maintenance page, run:

```bash
./start-ai-layout.command
```

Then open `http://127.0.0.1:8765/`.

Open **AI 模型设置** in the page and provide an API Base URL, model name, and API Key. Presets are included for Doubao/Volcano Ark and OpenAI; other OpenAI Chat Completions compatible providers can use the custom option. The local server forwards requests without writing API keys to disk. Keys remain in browser session storage unless the user explicitly enables local remembering.
