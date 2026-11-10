# Arabic Detail Typography Skill

Codex skill and local maintenance page for extracting layout-ready ecommerce copy and rendering transparent Arabic typography layers with local fonts.

## Install

1. Unzip the package.
2. Move the included `arabic-detail-typography` folder into `~/.codex/skills/`.
3. Start a new Codex conversation so the Skill is reloaded.
4. Invoke it with `$arabic-detail-typography`.

On macOS, the equivalent installation commands are:

```bash
mkdir -p ~/.codex/skills
cp -R /path/to/arabic-detail-typography ~/.codex/skills/
```

To open the maintenance page:

```bash
cd ~/.codex/skills/arabic-detail-typography
chmod +x start-ai-layout.command
./start-ai-layout.command
```

Then open `http://127.0.0.1:8765/`.

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

The internal team package includes `arabic-typography-ai.local.json` at the Skill root so the AI recognition flow works immediately after installation. Do not rename the file, upload it to a public repository, or share it outside the intended team. `ARABIC_TYPOGRAPHY_AI_CONFIG` may point to a different config path.

The maintenance page never displays the API key. All AI requests are proxied through the local service at `127.0.0.1`.
