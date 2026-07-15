# Kura — Design System

Style guide for the Kura app, a self-hosted personal digital health record (PocketBase + React). This document is meant to be handed to a development agent: every visual choice in the app must derive from the tokens and rules defined here. When in doubt, the icon is the source of truth: emerald green, rounded shapes, soft strokes, and the ECG trace as the signature element.

---

## 1. Identity and principles

**Personality:** calm, trustworthy, personal. Kura holds health data: the interface must convey order and safety, never hospital urgency. No red as a dominant color, no emergency-room iconography.

**Three operating principles:**

1. **Soft but precise.** Generously rounded corners and round-terminated strokes (as in the logo), but rigorous grids, alignment and typographic hierarchy. Medical data is serious; the frame is welcoming.
2. **Green guides, it doesn't decorate.** Emerald green marks primary actions, active states, and the brand. Surfaces stay neutral and light: a health document must be readable before it's decorated.
3. **The ECG is the signature.** The logo's trace reappears sparingly as a distinctive element: loading indicator, decorative divider in empty states, a detail in the header. At most one occurrence per screen.

---

## 2. Colors

### 2.1 Brand palette (from the logo)

| Token | Hex | Use |
|---|---|---|
| `--kura-50` | `#ECFDF5` | Tinted backgrounds, hover on light green elements |
| `--kura-100` | `#D1FAE5` | Badges, chips, active-state backgrounds |
| `--kura-200` | `#A7F3D0` | Borders of selected elements |
| `--kura-300` | `#6EE7B7` | **Mint accent** (the logo's ECG trace): charts, details on dark backgrounds |
| `--kura-400` | `#34D399` | Decorative icons, indicators |
| `--kura-500` | `#10B981` | Charts, progress bars |
| `--kura-600` | `#059669` | **Primary**: buttons, links, focus ring |
| `--kura-700` | `#047857` | Primary hover, green text on light backgrounds |
| `--kura-800` | `#065F46` | Active/pressed, high-contrast green text |
| `--kura-900` | `#064E3B` | Dark brand backgrounds (dark sidebar, hero) |

Brand gradient (icon, splash and sidebar hero only): `linear-gradient(135deg, #059669, #047857)`.

### 2.2 Neutrals (grays with a cool green undertone)

| Token | Hex | Use |
|---|---|---|
| `--neutral-0` | `#FFFFFF` | Card surfaces |
| `--neutral-50` | `#F6F8F7` | App background (body) |
| `--neutral-100` | `#EDF1EF` | Secondary backgrounds, alternating table rows |
| `--neutral-200` | `#DCE3E0` | Borders, dividers |
| `--neutral-400` | `#94A3A0` | Placeholder text, disabled icons |
| `--neutral-500` | `#64756F` | Secondary text, labels, metadata |
| `--neutral-700` | `#3D4A45` | Supporting text |
| `--neutral-900` | `#17211D` | Primary text, headings |

### 2.3 Semantic colors

| Token | Hex | Use |
|---|---|---|
| `--success` | `#059669` | Same as primary: confirmations, successful uploads |
| `--warning` | `#D97706` | Upcoming deadlines (e.g. vaccine boosters), attention |
| `--danger` | `#DC2626` | Errors and deletions only. Never for medical content |
| `--info` | `#0284C7` | Informational notes, tips |

Each semantic color has a ~10% surface variant: `--warning-bg: #FEF3E2`, `--danger-bg: #FDECEC`, `--info-bg: #E8F4FB`, `--success-bg: var(--kura-50)`.

### 2.4 Colors by document category

To tell health document types apart at a glance (badges and icons, never long text):

| Category | Badge color | Badge background |
|---|---|---|
| Reports / lab results | `#047857` | `#D1FAE5` |
| Prescriptions / medication | `#7C3AED` | `#EDE9FE` |
| Vaccinations | `#0284C7` | `#E0F2FE` |
| Appointments / specialists | `#D97706` | `#FEF3E2` |
| Imaging (X-ray, MRI, ultrasound) | `#475569` | `#E2E8F0` |
| Other | `#64756F` | `#EDF1EF` |

### 2.5 Dark mode

Dark mode flips the surfaces while keeping green recognizable. App background `#0E1613` (green-black, not pure black), card `#16211C`, borders `#25332D`, primary text `#E8EFEB`, secondary text `#8FA39B`. The primary becomes `--kura-400` (#34D399) for buttons and `--kura-300` (#6EE7B7) for links and accents, because on dark backgrounds the 600 shade doesn't have enough contrast.

---

## 3. Typography

Three roles, three families (all on Google Fonts, self-hostable via `@fontsource/*` for consistency with the project's self-hosted philosophy):

| Role | Font | Fallback | Use |
|---|---|---|---|
| Display | **Outfit** | system-ui, sans-serif | Page titles, large dashboard numbers, text logo |
| Body | **Inter** | system-ui, sans-serif | Everything else: paragraphs, forms, navigation |
| Data | **JetBrains Mono** | monospace | Clinical values, dosages, ID/insurance card numbers, metadata dates |

Using mono for clinical values is deliberate: "Blood glucose **92 mg/dL**" with the value in JetBrains Mono makes numbers scannable and gives the app a precise "data chart" character.

### Type scale

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `--text-display` | 32px / 38px | Outfit 600 | Page title (one per screen) |
| `--text-title` | 24px / 30px | Outfit 600 | Section titles, modal titles |
| `--text-heading` | 18px / 26px | Inter 600 | Card titles, document titles |
| `--text-body` | 15px / 23px | Inter 400 | Base text |
| `--text-body-strong` | 15px / 23px | Inter 600 | Emphasis, form labels |
| `--text-small` | 13px / 19px | Inter 400 | Metadata, captions, helper text |
| `--text-mono` | 14px / 20px | JetBrains Mono 500 | Values and codes |

Rules: sentence case everywhere (never ALL CAPS except 11px micro-labels with 0.06em letter-spacing for section eyebrows). Tabular numbers (`font-variant-numeric: tabular-nums`) in every table and list of values.

---

## 4. Shape, spacing, elevation

### 4.1 Radii (derived from ~22% of the icon)

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 8px | Chips, badges, tags |
| `--radius-md` | 12px | Buttons, inputs, selects |
| `--radius-lg` | 16px | Cards, modals, dropdowns |
| `--radius-xl` | 24px | Hero containers, large preview images |
| `--radius-full` | 9999px | Avatars, pills, toggles |

Never sharp corners (0px): they'd betray the logo's visual language.

### 4.2 Spacing

Base scale 4px: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`. Card padding: 20px (24px on wide desktop). Gap between cards in a grid: 16px. Margin between page sections: 40px. Main container: max-width 1120px, 24px horizontal padding (16px on mobile).

### 4.3 Shadows (green-tinted, never blue-gray)

```css
--shadow-sm: 0 1px 2px rgba(6, 78, 59, 0.06);
--shadow-md: 0 4px 12px rgba(6, 78, 59, 0.08);
--shadow-lg: 0 12px 32px rgba(6, 78, 59, 0.12);
```

Cards at rest use `--shadow-sm` + `--neutral-200` border; on hover (only if clickable) they move to `--shadow-md` with a 150ms transition.

### 4.4 Motion

Short, discreet transitions: 150ms `ease-out` for hover/focus, 220ms `cubic-bezier(0.2, 0.8, 0.2, 1)` for modals and drawers. Always respect `prefers-reduced-motion: reduce` by disabling non-essential animations. The only "character" animation allowed: the ECG trace drawing itself in (stroke-dashoffset) as a loading indicator.

---

## 5. Components

### 5.1 Buttons

Height 40px (36px compact), 16px horizontal padding, `--radius-md` radius, Inter 600 15px font, optional 18px icon on the left with 8px gap.

| Variant | Rest | Hover | Active |
|---|---|---|---|
| Primary | bg `--kura-600`, white text | bg `--kura-700` | bg `--kura-800` |
| Secondary | white bg, `--neutral-200` border, `--neutral-900` text | bg `--neutral-50` | bg `--neutral-100` |
| Ghost | transparent, `--kura-700` text | bg `--kura-50` | bg `--kura-100` |
| Destructive | white bg, `--danger` border and text | bg `--danger-bg` | — |

Only one primary button per view. Deletions always require confirmation in a modal.

### 5.2 Document card (the app's central component)

Structure: category icon in a 40px square with 12px radius and the category colors (§2.4) → document title in `--text-heading` → metadata row in `--text-small` colored `--neutral-500` (date in mono · doctor/facility · file size) → category badge top-right. Left border NOT colored (no accent border: too "ticket system"); the category speaks through icon and badge instead.

### 5.3 Forms and inputs

Input: 40px height, white bg, `--neutral-200` border, `--radius-md` radius, 12px padding. Focus: `--kura-600` border + `0 0 0 3px rgba(5, 150, 105, 0.15)` ring. Error: `--danger` border + helper text below in `--danger`, never color alone (add an icon or text too). Label above the input in `--text-body-strong`, helper text below in `--text-small`. File upload: dropzone with dashed `--neutral-200` border, `--radius-lg` radius, on drag-over `--kura-600` border and `--kura-50` bg.

### 5.4 Navigation

Desktop sidebar (240px) on `--neutral-0` bg with a right border; active item: `--kura-50` bg, `--kura-800` text, `--kura-600` icon, `--radius-md` radius. Kura logo at the top (32px icon + "Kura" wordmark in Outfit 600). On mobile: 4-5 item bottom bar, 24px icon + 11px label, active item in `--kura-600`.

### 5.5 Badges, states and feedback

Badge: pill radius, 4px 10px padding, 12px/600 text, colors from §2.4 or semantic. Toast: `--radius-lg` card with a semantic icon, 4s auto-dismiss, bottom-center on mobile and bottom-right on desktop. Empty state: minimal illustration with the ECG trace in `--kura-300`, title in `--text-heading`, one line of explanation and a primary button inviting action ("Upload your first document").

### 5.6 Tables and value lists

Header in `--text-small` 600 small-caps `--neutral-500`; rows with `--neutral-200` dividers, `--neutral-50` hover; numeric values in JetBrains Mono, right-aligned. On mobile, tables collapse into cards.

---

## 6. Iconography and assets

Icon set: **Lucide** (already consistent with React), stroke-width 2, round terminations — the same visual language as the logo. Sizes: 18px inline, 20px in buttons, 24px in navigation. Default color `--neutral-500`, active/brand in `--kura-600`. Mixing different icon sets is forbidden.

`kura-icon.svg` is the official icon (favicon, PWA, app icon). The ECG trace extractable from the logo for decorative use is the path: `M0 40 L86 120 H132 L162 44 L196 176 L226 120 H290` (round stroke, proportional width).

---

## 7. Accessibility (non-negotiable)

Minimum WCAG AA contrast: normal text 4.5:1, large text 3:1 — this is why green text on white uses `--kura-700`/`--kura-800`, never 400/500. Visible focus on every interactive element (green ring §5.3, never `outline: none` without a replacement). All actions reachable by keyboard; modals with a focus trap and `Esc` to close. Information is never conveyed by color alone (badge = color + text). Minimum touch target 44×44px on mobile. `lang` attribute set on the document and alt text on every document preview.

---

## 8. Ready-to-use CSS tokens

```css
:root {
  /* Brand */
  --kura-50:#ECFDF5; --kura-100:#D1FAE5; --kura-200:#A7F3D0;
  --kura-300:#6EE7B7; --kura-400:#34D399; --kura-500:#10B981;
  --kura-600:#059669; --kura-700:#047857; --kura-800:#065F46; --kura-900:#064E3B;

  /* Neutrals */
  --neutral-0:#FFFFFF; --neutral-50:#F6F8F7; --neutral-100:#EDF1EF;
  --neutral-200:#DCE3E0; --neutral-400:#94A3A0; --neutral-500:#64756F;
  --neutral-700:#3D4A45; --neutral-900:#17211D;

  /* Semantic */
  --success:#059669; --success-bg:#ECFDF5;
  --warning:#D97706; --warning-bg:#FEF3E2;
  --danger:#DC2626;  --danger-bg:#FDECEC;
  --info:#0284C7;    --info-bg:#E8F4FB;

  /* Surfaces and text */
  --bg-app:var(--neutral-50); --bg-card:var(--neutral-0);
  --border:var(--neutral-200);
  --text-primary:var(--neutral-900); --text-secondary:var(--neutral-500);
  --brand:var(--kura-600); --brand-hover:var(--kura-700); --brand-active:var(--kura-800);

  /* Shape */
  --radius-sm:8px; --radius-md:12px; --radius-lg:16px; --radius-xl:24px; --radius-full:9999px;

  /* Shadows */
  --shadow-sm:0 1px 2px rgba(6,78,59,.06);
  --shadow-md:0 4px 12px rgba(6,78,59,.08);
  --shadow-lg:0 12px 32px rgba(6,78,59,.12);

  /* Fonts */
  --font-display:'Outfit',system-ui,sans-serif;
  --font-body:'Inter',system-ui,sans-serif;
  --font-mono:'JetBrains Mono',monospace;

  /* Motion */
  --ease-out:ease-out; --ease-spring:cubic-bezier(.2,.8,.2,1);
  --dur-fast:150ms; --dur-med:220ms;
}

[data-theme="dark"] {
  --bg-app:#0E1613; --bg-card:#16211C; --border:#25332D;
  --text-primary:#E8EFEB; --text-secondary:#8FA39B;
  --brand:var(--kura-400); --brand-hover:var(--kura-300); --brand-active:var(--kura-500);
  --shadow-sm:none; --shadow-md:0 4px 12px rgba(0,0,0,.4); --shadow-lg:0 12px 32px rgba(0,0,0,.5);
}
```

### Equivalent Tailwind extension (if the project uses Tailwind)

```js
// tailwind.config.js — theme.extend
colors: {
  kura: { 50:'#ECFDF5',100:'#D1FAE5',200:'#A7F3D0',300:'#6EE7B7',400:'#34D399',
          500:'#10B981',600:'#059669',700:'#047857',800:'#065F46',900:'#064E3B' },
  neutral: { 0:'#FFFFFF',50:'#F6F8F7',100:'#EDF1EF',200:'#DCE3E0',
             400:'#94A3A0',500:'#64756F',700:'#3D4A45',900:'#17211D' },
},
borderRadius: { sm:'8px', md:'12px', lg:'16px', xl:'24px' },
fontFamily: {
  display:['Outfit','system-ui','sans-serif'],
  sans:['Inter','system-ui','sans-serif'],
  mono:['JetBrains Mono','monospace'],
},
boxShadow: {
  sm:'0 1px 2px rgba(6,78,59,.06)',
  md:'0 4px 12px rgba(6,78,59,.08)',
  lg:'0 12px 32px rgba(6,78,59,.12)',
},
```

---

## 9. Quick rules for the agent (checklist)

1. Every color, radius, shadow and font comes from the tokens in §8: no hardcoded values in components.
2. Only one green primary button per view; red appears only for errors and deletions.
3. Clinical values, dosages and codes always in JetBrains Mono with `tabular-nums`.
4. Cards and white surfaces on `--bg-app` background, never white-on-white without a border.
5. Corners always rounded per the scale; icons only Lucide, stroke 2, round terminations.
6. The ECG motif appears at most once per screen (loading, empty state or header, not all at once).
7. Visible green focus ring everywhere; AA contrast verified; touch targets ≥ 44px.
8. Dark mode via `[data-theme="dark"]`: use only the semantic tokens (`--bg-card`, `--text-primary`, `--brand`…), never the raw scale values, so the theme flips for free.
9. Sentence case throughout the UI; dates in `DD Mon YYYY` format (e.g. `12 Jul 2026`) in metadata.
10. Before introducing a new component, check whether it can be composed from the ones in §5.
