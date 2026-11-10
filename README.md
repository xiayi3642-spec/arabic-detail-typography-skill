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

AI requests read `arabic-typography-ai.local.json` from the Skill directory or one of its parent directories. Keep that file outside Git and use this shape:

```json
{
  "provider": "doubao",
  "baseUrl": "https://ark.cn-beijing.volces.com/api/v3",
  "model": "your-model-id",
  "apiKey": "your-api-key"
}
```

The page contains no API settings. Distribute the local config separately when the same managed key should be shared with a team. `ARABIC_TYPOGRAPHY_AI_CONFIG` may point to a different config path.
