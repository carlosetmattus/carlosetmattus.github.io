# Bionic Reading — Chrome Extension

A Chrome extension that converts any paragraph to bionic reading format on hover. The first letters of each word are bolded, guiding your eye and helping your brain auto-complete words faster.

## How it works

Hover your mouse over any paragraph on any webpage. The page dims, the paragraph is spotlit, and the text converts to bionic format. Move away and everything restores.

## Installation

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `bionic-reading` folder

## Features

### Bionic text
Words are bolded based on their length — short words get 1 letter bolded, longer words get ~40%. This is lighter than a flat 50% and easier on the eyes across a full article.

### Focus mode
When you hover a paragraph, a dark overlay dims the rest of the page and the active paragraph is spotlit above it. Fades in and out smoothly.

### Click to pin
Click any paragraph to lock it in bionic + spotlight mode. You can move your mouse freely while the pinned paragraph stays lit. Click it again to unpin.

### Smart skipping
Elements with fewer than 30 characters are ignored — nav links, buttons, and labels are left alone. Code blocks, `<pre>`, `<script>`, and editable fields are also skipped.

### Image caption support
Italic captions and descriptions next to images are detected even when the text is wrapped in `<em>` or `<i>` inside a container. Any element whose only children are inline (no nested block elements) is treated as a readable paragraph.

## Files

```
bionic-reading/
├── manifest.json   # Extension config (Manifest V3)
├── content.js      # Hover detection, bionic conversion, focus mode, pin logic
├── styles.css      # Bold styling, highlight, overlay, elevation
└── README.md
```

## Tuning

| What | Where | Default |
|------|-------|---------|
| Bold ratio | `content.js` → `boldLen()` | ~40% scaled by word length |
| Hover delay | `content.js` → `setTimeout(..., 80)` | 80ms |
| Min text length | `content.js` → `MIN_TEXT_LENGTH` | 30 chars |
| Overlay darkness | `styles.css` → `#bionic-overlay` | 50% black |
| Highlight color | `styles.css` → `.bionic-highlight` | Light blue |

## Known limitations

- Focus mode elevation may not work on pages where the paragraph sits inside a CSS stacking context (e.g., a parent with `transform` or `opacity`). Affects some complex SPAs; works on most article and blog sites.
