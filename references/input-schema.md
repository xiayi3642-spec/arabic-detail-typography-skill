# 输入格式

## 顶层

```json
{
  "project": "项目英文短名",
  "canvas": { "width": 1000, "height": 1000 },
  "font_style": "sans",
  "theme": {
    "ink": "#4B2F24",
    "muted": "#776A63",
    "accent": "#D6A24A"
  },
  "copy_status": "approved | draft-needs-native-review",
  "pages": []
}
```

画布默认 1000×1000。背景始终透明；`theme` 只控制文字和排版构件。`font_style` 可为 `sans` 或 `serif`；当前默认并已验证的是 Almarai `sans`。

## 页面字段

```json
{
  "id": "01-hero",
  "role": "hero",
  "template": "hero-icons",
  "title_lines": ["مجموعة مصابيح", "كريستالية للأجواء"],
  "subtitle_lines": ["إضاءة دافئة تناسب زوايا المنزل المختلفة"],
  "highlights": ["كريستالية", "للأجواء"],
  "decoration": "sparkles",
  "icons": [
    { "icon": "lamp", "label": "٤ مصابيح" },
    { "icon": "shapes", "label": "٣ تصاميم" },
    { "icon": "sparkles", "label": "أجواء متعددة" }
  ],
  "zh_audit": "水晶氛围灯套组",
  "source_evidence": ["原始材料明确写有 4 盏灯", "原始材料明确写有 3 种造型"]
}
```

必填：`id`、`template`、`title_lines`、`subtitle_lines`。其余按模板需要填写。

`source_evidence` 不参与渲染，用来记录最终文案对应的原始事实摘要；输入杂乱、来自会话/会议或经过明显提炼时应填写。存在冲突但无法判断时可增加 `needs_confirmation`，并避免把该项渲染成确定事实。

### `icons`

只用于 `hero-icons`。本工作流默认提炼并使用 **3 个**已确认卖点；只有用户明确指定其他数量，或可靠事实确实不足且已标记缺口时才偏离。渲染器兼容 2–5 个：

```json
{
  "icon": "lamp",
  "label": "٤ مصابيح"
}
```

## 模板容量

| 模板 | 适用内容 | 容量建议 |
|---|---|---|
| `hero-icons` | 首图、核心价值 | 1–2 行标题；1–2 行副标题；默认 3 个短 Icon 卖点 |
| `center-divider` | 单一卖点 | 1–2 行标题；1–2 行副标题；细线菱形装饰 |
| `side-orb` | 氛围或审美卖点 | 1–2 行标题；1–2 行副标题；柔光圆装饰 |
| `minimal-mark` | 功能或材质卖点 | 1–2 行标题；1–2 行副标题；双菱形标记 |

如果内容不符合容量，先编辑内容或换模板，不强塞。

`highlights` 最多两个短语。它们可以出现在主标题或副标题中，渲染时只把第一次匹配变为强调色。

`accent` 仅在顶层 `font_style` 为 `serif` 时允许填写；此时使用 Stay Dreaming。非衬线方案即使传入该字段也不渲染。

## 文案状态

- `approved`：用户确认可直接用于出图。
- `draft-needs-native-review`：AI 起草或翻译，必须保留 `zh_audit`，交付时提醒语言审核。
