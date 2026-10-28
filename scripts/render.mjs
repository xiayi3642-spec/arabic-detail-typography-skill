#!/usr/bin/env node
import fs from "node:fs/promises";
import process from "node:process";
import { createRequire } from "node:module";
import { dirname, resolve, basename, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..");
const require = createRequire(import.meta.url);

function parseArgs(argv) {
  if (!argv[2]) throw new Error("Usage: node render.mjs input.json --out output-directory");
  const input = resolve(argv[2]);
  const outIndex = argv.indexOf("--out");
  const out = resolve(outIndex >= 0 && argv[outIndex + 1] ? argv[outIndex + 1] : join(dirname(input), "arabic-typography-output"));
  return { input, out };
}

function esc(value = "") {
  return String(value).replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" })[c]);
}

function richText(value, highlights = []) {
  let html = esc(value);
  for (const phrase of highlights.slice(0, 2)) {
    const escaped = esc(phrase);
    if (escaped && html.includes(escaped)) html = html.replace(escaped, `<span class="highlight">${escaped}</span>`);
  }
  return html;
}

function textLines(values, highlights = []) {
  const list = Array.isArray(values) ? values : [values || ""];
  return list.filter(Boolean).map((line) => `<span class="line">${richText(line, highlights)}</span>`).join("");
}

function density(page) {
  const longest = Math.max(...(page.title_lines || [page.title || ""]).map((line) => String(line).replace(/\s/g, "").length));
  return longest > 21 ? "title-long" : "title-normal";
}

const ICONS = {
  lamp: `<path d="M16 20a8 8 0 1 1 16 0c0 4-2 6-4.5 8.5V32h-7v-3.5C18 26 16 24 16 20Z"/><path d="M20 36h8M21.5 40h5"/>`,
  shapes: `<circle cx="16" cy="18" r="6"/><rect x="26" y="12" width="12" height="12" rx="2"/><path d="m14 36 7-10 7 10Z"/>`,
  sparkles: `<path d="m24 8 2.6 8.4L35 19l-8.4 2.6L24 30l-2.6-8.4L13 19l8.4-2.6Z"/><path d="m37 29 1.4 4.6L43 35l-4.6 1.4L37 41l-1.4-4.6L31 35l4.6-1.4Z"/>`,
  moon: `<path d="M34 32A14 14 0 0 1 17 14a15 15 0 1 0 17 18Z"/>`,
  touch: `<path d="M22 23V10a4 4 0 0 1 8 0v17l3-3a4 4 0 0 1 6 5l-8 11H18l-7-12a4 4 0 0 1 7-4l4 6"/>`,
};

function iconSvg(name) {
  return `<svg viewBox="0 0 48 48" aria-hidden="true">${ICONS[name] || `<path d="m24 8 5 11 11 5-11 5-5 11-5-11-11-5 11-5Z"/>`}</svg>`;
}

function iconRow(page) {
  const list = page.icons || [];
  return `<div class="icon-row" style="--icon-count:${list.length}">${list.map((item) => `
    <article class="icon-item">
      <span class="icon">${iconSvg(item.icon)}</span>
      <p class="icon-label"><bdi>${richText(item.label, page.highlights)}</bdi></p>
    </article>`).join("")}</div>`;
}

function handwriting(page, fontStyle) {
  return fontStyle === "serif" && page.accent ? `<p class="latin-accent" dir="ltr">${esc(page.accent)}</p>` : "";
}

function pageHtml(page, fontStyle) {
  const template = page.template;
  const highlights = page.highlights || [];
  if (highlights.length > 2) throw new Error(`${page.id}: highlights accepts at most two phrases`);
  if (template === "hero-icons" && ((page.icons || []).length < 2 || (page.icons || []).length > 5)) {
    throw new Error(`${page.id}: hero-icons requires 2–5 selling-point icons`);
  }

  const title = `<h1 class="title">${textLines(page.title_lines, highlights)}</h1>`;
  const subtitle = `<p class="subtitle">${textLines(page.subtitle_lines, highlights)}</p>`;
  const accent = handwriting(page, fontStyle);
  let inner = "";

  if (template === "hero-icons") {
    inner = `${title}${subtitle}${accent}<span class="sparkle-cluster" aria-hidden="true"></span>${iconRow(page)}`;
  } else if (template === "center-divider") {
    inner = `${title}<span class="rule-diamond" aria-hidden="true"><i class="diamond"></i></span>${subtitle}${accent}`;
  } else if (template === "side-orb") {
    inner = `<span class="orb" aria-hidden="true"></span>${title}${subtitle}<span class="rule-diamond" aria-hidden="true"><i class="diamond"></i></span>${accent}`;
  } else if (template === "minimal-mark") {
    inner = `${title}<span class="rule-double" aria-hidden="true"><i class="diamond"></i><i class="diamond"></i></span>${subtitle}${accent}`;
  } else {
    throw new Error(`Unknown template: ${template}`);
  }

  return `<section class="canvas ${esc(template)} ${density(page)} style-${esc(fontStyle)}" data-id="${esc(page.id)}" data-template="${esc(template)}"><div class="safe">${inner}</div></section>`;
}

async function loadPlaywright() {
  const candidates = [
    "playwright",
    resolve(dirname(process.execPath), "..", "node_modules", "playwright"),
    "/Users/shaozi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
  ];
  for (const candidate of candidates) {
    try { return require(candidate); } catch {}
  }
  throw new Error("Playwright not found");
}

const { input, out } = parseArgs(process.argv);
const config = JSON.parse(await fs.readFile(input, "utf8"));
if (!Array.isArray(config.pages) || !config.pages.length) throw new Error("Input must contain a non-empty pages array");
const fontStyle = config.font_style === "serif" ? "serif" : "sans";

await fs.mkdir(out, { recursive: true });
await fs.cp(resolve(skillRoot, "assets", "fonts"), resolve(out, "fonts"), { recursive: true });
const css = await fs.readFile(resolve(skillRoot, "assets", "base.css"), "utf8");
const width = config.canvas?.width || 1000;
const height = config.canvas?.height || 1000;
const theme = config.theme || {};
const html = `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${css}\n:root{--w:${width}px;--h:${height}px;--ink:${theme.ink || "#573725"};--muted:${theme.muted || "#8a776b"};--accent:${theme.accent || "#d8a044"}}</style>
</head><body>${config.pages.map((page) => pageHtml(page, fontStyle)).join("\n")}</body></html>`;
const htmlPath = resolve(out, "typography-set.html");
await fs.writeFile(htmlPath, html, "utf8");

const playwright = await loadPlaywright();
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await playwright.chromium.launch({ headless: true, executablePath: chrome });
const audit = {
  project: config.project || basename(input, extname(input)),
  copy_status: config.copy_status || "unspecified",
  font_style: fontStyle,
  fontLoaded: false,
  handwritingLoaded: null,
  pages: [],
};

try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  audit.fontLoaded = await page.evaluate((style) => {
    const almarai = [300, 400, 700, 800].every((w) => document.fonts.check(`${w} 48px Almarai`, "مرحبا"));
    const editorial = style !== "serif" || document.fonts.check('400 48px "Arabic Editorial"', "مرحبا");
    return almarai && editorial;
  }, fontStyle);
  if (fontStyle === "serif") audit.handwritingLoaded = await page.evaluate(() => document.fonts.check('400 48px "Stay Dreaming"', "Dream"));

  const pageAudits = await page.evaluate(() => [...document.querySelectorAll(".canvas")].map((card) => {
    const box = card.getBoundingClientRect();
    const spills = [];
    const clipped = [];
    for (const el of card.querySelectorAll("h1,p,.title .line,.subtitle .line,.icon-label,.latin-accent")) {
      const text = (el.textContent || "").trim();
      if (!text) continue;
      const r = el.getBoundingClientRect();
      const overflow = { top: box.top - r.top, right: r.right - box.right, bottom: r.bottom - box.bottom, left: box.left - r.left };
      const worst = Object.entries(overflow).filter(([, px]) => px > 1).sort((a,b) => b[1] - a[1])[0];
      if (worst) spills.push({ element: el.className || el.tagName, edge: worst[0], px: Math.round(worst[1]), text: text.slice(0, 60) });
      const style = getComputedStyle(el);
      const hidesX = style.overflowX !== "visible";
      const hidesY = style.overflowY !== "visible";
      if ((hidesY && el.scrollHeight - el.clientHeight > 2) || (hidesX && el.scrollWidth - el.clientWidth > 2)) {
        clipped.push({ element: el.className || el.tagName, text: text.slice(0, 60) });
      }
    }
    return { id: card.dataset.id, template: card.dataset.template, spills, clipped };
  }));

  await page.evaluate(() => document.body.classList.add("capture"));
  const pngs = [];
  for (let i = 0; i < config.pages.length; i++) {
    const id = config.pages[i].id || `page-${i + 1}`;
    const fileName = `${String(i + 1).padStart(2, "0")}-${id.replace(/[^a-zA-Z0-9_-]+/g, "-")}.png`;
    const locator = page.locator(".canvas").nth(i);
    await locator.evaluate((el) => el.classList.add("capture-target"));
    await locator.screenshot({ path: resolve(out, fileName), omitBackground: true });
    await locator.evaluate((el) => el.classList.remove("capture-target"));
    pngs.push(fileName);
    audit.pages.push({ ...pageAudits[i], file: fileName });
  }

  const previewHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;padding:28px;background:#e8e5df;font-family:Arial,sans-serif;color:#443b35}main{display:grid;grid-template-columns:repeat(2,520px);gap:24px}.tile{padding:12px;background:#fff;border-radius:12px}.checker{width:496px;height:496px;background-color:#fff;background-image:linear-gradient(45deg,#eee 25%,transparent 25%),linear-gradient(-45deg,#eee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eee 75%),linear-gradient(-45deg,transparent 75%,#eee 75%);background-size:28px 28px;background-position:0 0,0 14px,14px -14px,-14px 0}.checker img{width:496px;height:496px;display:block}p{margin:10px 2px 2px;font-size:16px}</style></head><body><main>${pngs.map((f,i)=>`<div class="tile"><div class="checker"><img src="${esc(f)}"></div><p>${esc(config.pages[i].id)} · ${esc(config.pages[i].template)}</p></div>`).join("")}</main></body></html>`;
  const previewPath = resolve(out, "contact-sheet.html");
  await fs.writeFile(previewPath, previewHtml, "utf8");
  const preview = await browser.newPage({ viewport: { width: 1100, height: 1200 }, deviceScaleFactor: 1 });
  await preview.goto(pathToFileURL(previewPath).href, { waitUntil: "networkidle" });
  await preview.screenshot({ path: resolve(out, "contact-sheet.png"), fullPage: true });
  await preview.close();
} finally {
  await browser.close();
}

await fs.writeFile(resolve(out, "audit.json"), JSON.stringify(audit, null, 2), "utf8");
const failed = !audit.fontLoaded || (fontStyle === "serif" && !audit.handwritingLoaded) || audit.pages.some((p) => p.spills.length || p.clipped.length);
console.log(JSON.stringify({ output: out, pages: audit.pages.length, fontLoaded: audit.fontLoaded, handwritingLoaded: audit.handwritingLoaded, auditPassed: !failed }, null, 2));
if (failed) process.exitCode = 2;
