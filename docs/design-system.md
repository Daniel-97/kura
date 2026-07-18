# Kura — Design System

Style guide for the Kura app, a self-hosted personal digital health record (PocketBase + React). This document is meant to be handed to a development agent: every visual choice in the app must derive from the tokens and rules defined here.

**Provenance.** This system adopts the visual language extracted from checkmate.so and the official Checkmate source (`bluewave-labs/checkmate`, `client/src/Utils/Theme/*`). Tokens marked **verified** come directly from that source code; the rest are the calibrated recipes built on top of it. Kura-specific elements (document model, category system, the ECG signature) are layered on this foundation and re-expressed with its tokens.

---

## 1. Identity and principles

**Personality:** sober, technical, trustworthy — "boring in the good way". Kura holds health data: the interface must convey order and reliability, like a well-run monitoring dashboard, never hospital urgency. No red as a dominant color, no emergency-room iconography.

**Four operating principles:**

1. **Quasi-monochrome, one accent.** Surfaces are near-monochrome; the brand green appears only in small, meaningful doses: primary action, active state, status dot, eyebrow. If green is everywhere, it means nothing.
2. **Hairlines over shadows.** Depth comes from 1px translucent borders, not drop shadows. The single official shadow is nearly invisible and reserved for floating layers (modals, dropdowns, toasts).
3. **Mono is the voice of data.** Every piece of machine-flavored content — clinical values, dosages, dates, IDs, file sizes, counts — is set in monospace. Prose is sans. This contrast is the backbone of the UI.
4. **The ECG is the signature.** The logo's trace reappears sparingly as a distinctive element: loading indicator, decorative divider in empty states, a detail in the header. At most one occurrence per screen, stroked in `--brand-accent`.

---

## 2. Colors

### 2.1 Brand and neutrals (verified from Checkmate source)

| Token | Hex | Origin | Use |
|---|---|---|---|
| `--brand` | `#13715B` | verified | Deep brand green: primary buttons, accents on light surfaces |
| `--brand-light` | `#4DAF94` | verified | Accent on dark surfaces: eyebrows, links, active icons |
| `--brand-soft` | `#ECF7F2` | verified | Tinted surfaces in light theme (selected rows, active nav) |
| `--gray-200` | `#EFEFEF` | verified | Light neutral |
| `--gray-700` | `#313131` | verified | Strong borders, secondary elements |
| `--gray-850` | `#1c1c21` | verified | Dark surfaces (cards, panels) |
| `--gray-900` | `#151518` | verified | Dark app background |

`--brand-accent` is the *active* accent and flips with the theme: `--brand-light` on dark, `--brand` on light. Components must reference `--brand-accent`, never the raw shades, so the theme flips for free.

### 2.2 Themes

Dark is the default theme, consistent with the adopted system; light is fully supported via `[data-theme="light"]`.

| Token | Dark (default) | Light |
|---|---|---|
| `--bg` | `#151518` | `#fafafa` |
| `--surface` | `#1c1c21` | `#ffffff` |
| `--surface-raised` | `#232329` | `#f4f4f5` |
| `--border` | `rgba(255,255,255,.08)` | `rgba(0,0,0,.08)` |
| `--border-strong` | `rgba(255,255,255,.14)` | `rgba(0,0,0,.14)` |
| `--text` | `#f4f4f5` | `#18181b` |
| `--text-secondary` | `#a1a1aa` | `#52525b` |
| `--text-muted` | `#71717a` | `#a1a1aa` |

Borders are translucent white/black, never opaque grays: they work on any surface without per-surface variants.

### 2.3 Semantic / status colors (verified: status-page themes in source)

| Token | Dark | Light | Use |
|---|---|---|---|
| `--status-up` | `#2fd7a2` | `#0f8a6d` | OK, confirmations, successful uploads, "in range" values |
| `--status-warn` | `#f0a837` | `#c2630a` | Upcoming deadlines (e.g. vaccine boosters), attention |
| `--status-down` | `#ff5b6b` | `#d11f2f` | Errors and deletions only. Never for medical content |

Each has a `-soft` surface variant at ~15–18% alpha (e.g. `--status-up-soft: rgba(47,215,162,.15)`). There is no separate `--info`: informational notes use neutral surfaces with a mono eyebrow — in a quasi-monochrome system, blue would be a second accent.

### 2.4 Colors by document category

Categories are told apart with **chips**: hairline border, mono label, colored 6px dot. Color lives in the dot (plus optional text tint), never as a solid badge background — solid color blocks break the quasi-monochrome rule.

| Category | Dot (dark) | Dot (light) |
|---|---|---|
| Reports / lab results | `var(--brand-accent)` | `var(--brand-accent)` |
| Prescriptions / medication | `#a78bfa` | `#7C3AED` |
| Vaccinations | `#60a5fa` | `#0284C7` |
| Appointments / specialists | `var(--status-warn)` | `var(--status-warn)` |
| Imaging (X-ray, MRI, ultrasound) | `#94a3b8` | `#475569` |
| Other | `var(--text-muted)` | `var(--text-muted)` |

---

## 3. Typography

Three voices. No custom sans: the identity of this system is the *contrast between voices*, not a display face.

| Role | Stack | Origin | Use |
|---|---|---|---|
| Sans (prose & UI) | `system-ui, sans-serif` | verified | Everything: navigation, paragraphs, forms, titles |
| Mono (data) | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace` | verified | Clinical values, dosages, dates, IDs, file sizes, eyebrows, metadata |
| Serif italic (editorial emphasis) | `"Instrument Serif", Georgia, "Iowan Old Style", "Palatino Linotype", serif` | fallback verified (`fontStacks.ts`) | The emphasized phrase in two-tone headings. Load Instrument Serif (Google Fonts, weight 400 only) in the app shell |

"Blood glucose **92 mg/dL**" with the value in mono makes numbers scannable and gives the app its precise, chart-like character. Always `font-variant-numeric: tabular-nums` on mono values.

### 3.1 The eyebrow (verified variant: 13px, weight 500, uppercase, letter-spacing 0.08em)

Mono, uppercase, letterspaced, in `--brand-accent` (or `--text-muted` for secondary groups). Opens every screen section and every card group: RECENT DOCUMENTS, VACCINATIONS, LAB RESULTS. This replaces all other micro-labels; it is the backbone of visual navigation.

### 3.2 Two-tone editorial headings

Page-level headings may split into two voices: sans, heavy, tight tracking for the statement; serif *italic*, lighter, in `--text-secondary` for the emphasized phrase — e.g. "Your health records, *actually yours.*". The serif runs optically small: compensate with `font-size: 1.06em`. Use sparingly: onboarding, empty states, dashboard greeting. Inside dense UI (tables, forms, modals) headings stay plain sans.

### 3.3 Type scale

App scale (base 13px, verified product scale: 9/11/13/15/18/23):

| Token | Size / lh | Font & weight | Use |
|---|---|---|---|
| `--text-display` | 23px / 28px | sans 600, tracking −0.02em | Page title (one per screen) |
| `--text-title` | 18px / 24px | sans 600 | Section titles, modal titles |
| `--text-heading` | 15px / 22px | sans 600 | Card titles, document titles |
| `--text-body` | 13px / 20px | sans 400 | Base text |
| `--text-small` | 11px / 16px | sans 400 | Helper text, captions |
| `--text-mono` | 13px / 18px | mono 500 | Values, codes, metadata |
| `--text-eyebrow` | 13px / 18px | mono 500 caps, ls 0.08em | Section eyebrows |

Sentence case everywhere; the eyebrow is the only uppercase element.

---

## 4. Shape, spacing, elevation, motion

### 4.1 Radii

`--radius-s: 6px` (chips, tags) · `--radius-m: 10px` (buttons, inputs) · `--radius-l: 16px` (cards, modals) · `--radius-full: 9999px` (pills, avatars, dots). No sharp corners, no oversized 24px+ radii.

### 4.2 Spacing

Base scale 4px: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`. Card padding 20–28px. Grid gap 16px. Section margin 40px+. Main container max-width 1120px, 24px horizontal padding (16px mobile).

### 4.3 Elevation

One official shadow (verified): `0px 4px 24px -4px rgba(16,24,40,.08), 0px 3px 3px -3px rgba(16,24,40,.03)` — floating layers only. Resting cards: `--surface` + `--border` hairline, **no shadow**. Hover on clickable cards changes only the border to `--border-strong`.

### 4.4 Motion

No ripples, ever (verified: disabled globally in the product theme). Interactions are dry: 160ms `ease` color/border transitions; 220ms `cubic-bezier(.2,.8,.2,1)` for modals and drawers. The status dot may pulse slowly (2s). The only character animation: the ECG trace drawing itself in (`stroke-dashoffset`) as loading indicator. Always respect `prefers-reduced-motion: reduce`.

---

## 5. Components

### 5.1 Buttons

Height 36px (compact 32px), 14–16px horizontal padding, `--radius-m`, sans 500.

| Variant | Rest | Hover |
|---|---|---|
| Primary | bg `--brand`, white text | bg `#0f5d4b` |
| Secondary | transparent, `--border-strong` border, `--text` | border `--text-muted` |
| Ghost | transparent, `--brand-accent` text | bg `--status-up-soft` |
| Destructive | transparent, `--status-down` border & text | bg `--status-down-soft` |

One primary per view. Deletions always confirm in a modal.

### 5.2 Document card (the app's central component)

`--surface` background, hairline border, `--radius-l`, hover = `--border-strong`. Structure: document title in `--text-heading` → **metadata row in mono** `--text-muted` with middle-dot separators (`12 Jul 2026 · Dr. Rossi · 2.4 MB`) → category chip (dot + mono label) top-right. No colored left border, no solid icon tile: the category speaks through the chip. When a value matters (e.g. a result), surface it as mono in `--text` inside the card body.

### 5.3 Stat blocks (dashboard)

Big number (28–40px, sans 600, tracking −0.02em, `tabular-nums`) over a tiny mono uppercase label in `--text-muted` (DOCUMENTS · VACCINATIONS · NEXT APPOINTMENT). Each stat in its own hairline card. This is the dashboard's primary pattern.

### 5.4 Forms and inputs

Input: 36px height, `--surface` bg, `--border` hairline, `--radius-m`, 12px padding, sans 13px. Focus: `--brand-accent` border + `0 0 0 3px var(--status-up-soft)` ring. Error: `--status-down` border + helper text below (never color alone). Label above in sans 600 13px; helper below in `--text-small` `--text-muted`. File upload: dropzone with dashed `--border-strong`, `--radius-l`; on drag-over `--brand-accent` border + `--status-up-soft` bg.

### 5.5 Navigation

Desktop sidebar 240px on `--bg` (not `--surface`) with a hairline right border. Group labels are eyebrows. Active item: `--surface-raised` bg, `--text` label, `--brand-accent` icon, `--radius-m`. Logo at top: 28px icon + "Kura" wordmark in sans 650. Mobile: 4–5 item bottom bar, 24px icons, active in `--brand-accent`.

### 5.6 Chips, pills, status and feedback

Chip (categories, tags): hairline border, `--radius-full`, 4px 10px padding, **mono 11px** label, 6px category dot. Pill (versions, counters): same, `--text-secondary`, translucent `--surface` bg. Status dot: 8px, `--status-up`, soft halo, optional slow pulse — use it for "synced", "backup ok", live states. Toast: `--surface` card with hairline border + official shadow, semantic dot + mono timestamp, 4s auto-dismiss, bottom-right (bottom-center mobile). Empty state: eyebrow → two-tone heading (serif italic on the second voice) → one explanatory line in `--text-secondary` → primary button ("Upload your first document"); the ECG trace in `--brand-accent` may appear here.

### 5.7 Tables and value lists

Header row as eyebrow style (mono 11px caps, `--text-muted`); hairline row dividers; hover `--surface-raised`. Numeric values mono, right-aligned, `tabular-nums`. On mobile, tables collapse into cards.

---

## 6. Iconography and assets

Icon set: **Lucide**, stroke-width 1.75–2, round terminations. Sizes: 16px inline, 18px in buttons, 20–24px in navigation. Default `--text-muted`, active/brand `--brand-accent`. Mixing icon sets is forbidden.

`kura-icon.svg` is the official icon (favicon, PWA, app icon). The ECG trace extractable from the logo for decorative use: `M0 40 L86 120 H132 L162 44 L196 176 L226 120 H290` (round stroke, proportional width, stroke `--brand-accent`).

---

## 7. Accessibility (non-negotiable)

WCAG AA minimum: normal text 4.5:1, large text 3:1. On dark, green text/icons use `--brand-light`, never `--brand` (too dark on `#151518`); on light, green text uses `--brand`, never `--brand-light` (too pale on white) — `--brand-accent` encodes exactly this rule. Visible focus ring on every interactive element (`2px solid var(--brand-accent)`, offset 2–3px; never `outline: none` without replacement). All actions keyboard-reachable; modals with focus trap and `Esc`. Information never by color alone (chip = dot + label). Touch targets ≥ 44px on mobile. `lang` set on the document; alt text on every document preview.

---

## 8. Ready-to-use CSS tokens

```css
:root {
  /* Brand (verified) */
  --brand:#13715B; --brand-light:#4DAF94; --brand-soft:#ECF7F2;
  --brand-accent:var(--brand-light);

  /* Neutrals (verified) */
  --gray-200:#EFEFEF; --gray-700:#313131; --gray-850:#1c1c21; --gray-900:#151518;

  /* Theme: dark (default) */
  --bg:var(--gray-900); --surface:var(--gray-850); --surface-raised:#232329;
  --border:rgba(255,255,255,.08); --border-strong:rgba(255,255,255,.14);
  --text:#f4f4f5; --text-secondary:#a1a1aa; --text-muted:#71717a;

  /* Status (verified) */
  --status-up:#2fd7a2;   --status-up-soft:rgba(47,215,162,.15);
  --status-warn:#f0a837; --status-warn-soft:rgba(240,168,55,.18);
  --status-down:#ff5b6b; --status-down-soft:rgba(255,91,107,.18);

  /* Document categories (dot colors) */
  --cat-report:var(--brand-accent); --cat-rx:#a78bfa; --cat-vax:#60a5fa;
  --cat-appt:var(--status-warn); --cat-imaging:#94a3b8; --cat-other:var(--text-muted);

  /* Typography */
  --font-sans:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --font-mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;
  --font-serif:"Instrument Serif",Georgia,"Iowan Old Style","Palatino Linotype",serif;

  /* Shape & elevation */
  --radius-s:6px; --radius-m:10px; --radius-l:16px; --radius-full:9999px;
  --shadow:0px 4px 24px -4px rgba(16,24,40,.08),0px 3px 3px -3px rgba(16,24,40,.03);

  /* Motion */
  --ease:ease; --ease-spring:cubic-bezier(.2,.8,.2,1);
  --dur-fast:160ms; --dur-med:220ms;
}

[data-theme="light"] {
  --brand-accent:var(--brand);
  --bg:#fafafa; --surface:#ffffff; --surface-raised:#f4f4f5;
  --border:rgba(0,0,0,.08); --border-strong:rgba(0,0,0,.14);
  --text:#18181b; --text-secondary:#52525b; --text-muted:#a1a1aa;
  --status-up:#0f8a6d; --status-warn:#c2630a; --status-down:#d11f2f;
  --status-up-soft:rgba(15,138,109,.12); --status-warn-soft:rgba(194,99,10,.12);
  --status-down-soft:rgba(209,31,47,.12);
  --cat-rx:#7C3AED; --cat-vax:#0284C7; --cat-imaging:#475569;
}
```

### Equivalent Tailwind extension (if the project uses Tailwind)

```js
// tailwind.config.js — theme.extend
colors: {
  brand: { DEFAULT:'#13715B', light:'#4DAF94', soft:'#ECF7F2' },
  gray:  { 200:'#EFEFEF', 700:'#313131', 850:'#1c1c21', 900:'#151518' },
  status:{ up:'#2fd7a2', warn:'#f0a837', down:'#ff5b6b' },
},
borderRadius: { sm:'6px', md:'10px', lg:'16px' },
fontFamily: {
  sans:['system-ui','sans-serif'],
  mono:['ui-monospace','SFMono-Regular','SF Mono','Menlo','Consolas','monospace'],
  serif:['"Instrument Serif"','Georgia','serif'],
},
boxShadow: { float:'0px 4px 24px -4px rgba(16,24,40,.08),0px 3px 3px -3px rgba(16,24,40,.03)' },
```

---

## 9. Quick rules for the agent (checklist)

1. Every color, radius, shadow and font comes from the tokens in §8: no hardcoded values in components.
2. Green appears only as: one primary button per view, active state, eyebrow, status dot. Red only for errors and deletions.
3. Always reference `--brand-accent` (never `--brand`/`--brand-light` directly) and the semantic surface tokens, so themes flip for free.
4. Clinical values, dosages, dates, IDs and metadata always in mono with `tabular-nums`; metadata rows use middle-dot separators.
5. Depth = hairline borders; the official shadow only on floating layers; hover changes borders, not shadows. No ripples.
6. Section labels are always the eyebrow (mono, caps, ls 0.08em); it is the only uppercase in the UI.
7. Two-tone serif-italic headings only at page level (onboarding, empty states, greetings), never inside dense UI. Load Instrument Serif in the app shell.
8. Categories = chip with colored dot + mono label; never solid colored badges; never color alone.
9. The ECG motif appears at most once per screen, stroked in `--brand-accent`.
10. Visible `--brand-accent` focus ring everywhere; AA contrast verified; touch targets ≥ 44px; sentence case; dates as `DD Mon YYYY`.
11. Before introducing a new component, check whether it can be composed from §5.