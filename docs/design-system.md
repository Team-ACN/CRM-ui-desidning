# Design System — ACN CRM

**Status:** Reverse-engineered from current UI (no dedicated component library exists yet — every page builds its own markup with Tailwind utility classes)
**Stack:** Tailwind CSS v4, `lucide-react` icons, React 19
**Last updated:** 2026-08-14

---

## 1. How styling works in this repo

There is no `theme.js`, no CSS variables, and no shared `<Button>`/`<Card>` components. Every screen (`src/components/**/*.jsx`) writes Tailwind utility classes directly on JSX elements. This doc exists so new screens stay visually consistent with the old ones — copy the patterns below instead of inventing new spacing/color combos.

Global setup:
- [tailwind.config.js](../tailwind.config.js) — only override is a custom `gray` scale (see below)
- [src/index.css](../src/index.css) — `@import "tailwindcss"` + `body { @apply bg-gray-50 text-gray-900; }`
- No custom font is loaded — uses Tailwind's default system font stack

---

## 2. Color

### Gray scale (explicitly defined in `tailwind.config.js`)

| Token | Hex | Used for |
|---|---|---|
| `gray-50` | `#F9FAFB` | Page/app background |
| `gray-100` | `#F3F4F6` | Hover states, subtle card backgrounds, disabled fills |
| `gray-200` | `#E5E7EB` | Default borders (most common border color in the app) |
| `gray-300` | `#D1D5DB` | Input borders, dividers |
| `gray-400` | `#9CA3AF` | Placeholder text, inactive icons |
| `gray-500` | `#6B7280` | Secondary/meta text |
| `gray-600` | `#4B5563` | Body text (secondary emphasis) |
| `gray-700` | `#374151` | Labels, stronger body text |
| `gray-800` | `#1F2937` | Rarely — dark fills |
| `gray-900` | `#111827` | Primary text, headings |

### Brand color: Emerald

Emerald is the brand/primary accent — used for the logo mark, primary buttons, active/success icon chips.

- `bg-emerald-800` — logo mark ("ACN" chip in [Sidebar.jsx](../src/components/Layout/Sidebar.jsx)), completed-step indicators
- `bg-emerald-600` hover `bg-emerald-700` — primary action buttons
- `bg-emerald-50` / `text-emerald-600` / `text-emerald-700` — light icon chips, subtle highlighted rows
- `ring-emerald-500` — focus rings on inputs

### Status / semantic colors

Pulled from the actual status-badge maps (e.g. [enquiryConstants.js](../src/components/Enquiries/enquiryConstants.js)). Pattern is always **pill background = `{color}-100`, text = `{color}-900`**, with a lighter `{color}-50` hover for dropdown options:

| Meaning | Trigger/badge | Hover option |
|---|---|---|
| Success / positive (e.g. "Site Visit Done", "Available") | `bg-green-100 text-green-900` | `bg-green-50 hover:bg-green-100` |
| Warning / pending / hold | `bg-yellow-100 text-yellow-900` | `bg-yellow-50 hover:bg-yellow-100` |
| Danger / negative (e.g. "Not Interested", "Sold") | `bg-red-100 text-red-900` | `bg-red-50 hover:bg-red-100` |
| Fallback / neutral | `bg-gray-100 text-gray-900` | `bg-gray-50 hover:bg-gray-100` |
| Info | `bg-blue-50` / `text-blue-600` / `ring-blue-500` | — |
| Attention (used sparingly, e.g. bulk-upload warnings) | `bg-amber-50` / `text-amber-700` / `border-amber-200` | — |
| Rare accents | `purple-50`, `orange-50` | used only in isolated one-off cases |

**Rule of thumb:** don't invent new colors for new statuses — map to green/yellow/red/gray using the pattern above.

---

## 3. Typography

No custom font sizes/weights are defined — this is stock Tailwind type scale, used consistently:

| Class | Real usage |
|---|---|
| `text-2xl font-bold` | Big stat numbers (StatsCards value) |
| `text-xl font-bold` | Page-level headers (e.g. "Good Morning, {name}") |
| `text-lg font-semibold` | Section headers within a page |
| `text-sm font-semibold` / `font-medium` | Card titles, table headers, nav labels |
| `text-sm` (no weight) | Default body/UI text — the most common text size in the app |
| `text-xs font-medium` | Stat card labels, meta text, small badges |
| `text-xs` (no weight) | Timestamps, helper text |

Weight usage: `font-medium` is the default for interactive/UI text (buttons, nav items, table cells). `font-semibold` for headings one level down from page title. `font-bold` reserved for page titles and big numbers.

---

## 4. Borders & radius

- Default border: `border border-gray-200` (cards, containers) or `border border-gray-100` (softer, nested cards)
- Border width is always 1px (`border`) — `border-2` shows up only a handful of times for emphasis
- Dividers: `border-b border-gray-100` / `border-t border-gray-200`

Radius scale, by component size:

| Class | Used for |
|---|---|
| `rounded-lg` | **Default** — buttons, cards, inputs, nav items (most common radius by far) |
| `rounded-xl` / `rounded-2xl` | Modals, larger containers, phone/canvas mockups |
| `rounded-md` | Small inline elements |
| `rounded-full` | Avatars, icon chips, pill badges, step indicators |

---

## 5. Elevation (shadows)

| Class | Used for |
|---|---|
| `shadow-sm` | **Default card shadow** — almost every card/panel uses this |
| `shadow-lg` / `shadow-xl` | Dropdowns, popovers, modals (things floating above content) |
| `shadow` (bare) | Occasional emphasis, rare |

---

## 6. Spacing

Padding — most common combos, use these instead of arbitrary values:

| Combo | Used for |
|---|---|
| `px-4 py-3` | Table cells/rows — the single most common spacing in the app |
| `px-3 py-2` / `px-3 py-2.5` | Buttons, inputs, nav items |
| `px-4 py-2` | Standard button padding |
| `px-2 py-1` / `px-2 py-0.5` | Small badges/pills |
| `px-6 py-4` | Modal/panel headers |

Flex/grid gaps: `gap-2` (tight, icon+label) → `gap-3` (button groups) → `gap-4` (card grids, page sections) → `gap-6`/`gap-8` (rare, large layout gaps).

---

## 7. Core component patterns

Copy these verbatim when building a new screen — they're the patterns repeated across `Agents`, `Leads`, `Properties`, `Enquiries`, `Requirements`, `QCDashboard`.

**Card / stat tile**
```jsx
<div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
  <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
  <p className="text-2xl font-bold text-gray-900">{value}</p>
</div>
```

**Primary button**
```jsx
<button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
```

**Secondary / outline button**
```jsx
<button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
```

**Status badge / dropdown trigger** (see `STATUS_STYLES` pattern in [enquiryConstants.js](../src/components/Enquiries/enquiryConstants.js))
```jsx
<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.trigger}`}>
  {status}
</span>
```

**Nav item (active/inactive)**
```jsx
className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
  isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
}`}
```

**Page header**
```jsx
<header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
```

**Dropdown/menu panel**
```jsx
<div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
```

---

## 8. Layout

- Sidebar: fixed `w-64 h-screen bg-white border-r border-gray-200` ([Sidebar.jsx](../src/components/Layout/Sidebar.jsx))
- Page header: `h-20`, page content wrapped in `p-6`
- Stat card grids: `grid grid-cols-4` to `grid-cols-8` (varies by page) with `gap-4`

---

## 9. Icons

- Library: [`lucide-react`](https://lucide.dev)
- Standard sizes: `size={16}` (inline/small), `size={20}` (nav items), `size={22}`+ (header icon chips)
- Icon chip pattern: `<div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Icon size={22} /></div>`

---

## 10. Motion

- `transition-colors` is the default (hover states) — used ~100 times, far more than any other transition
- `transition-transform` for rotating chevrons (`rotate-180` on open dropdowns)
- Durations are rarely set explicitly (`duration-200`/`duration-300` only a few places) — Tailwind's default duration is used almost everywhere

---

## 11. Gaps / things to decide as the product grows

These aren't in the code yet — flag before inventing your own answer:
- No shared `Button`/`Card`/`Badge`/`Modal` components exist — everything is copy-pasted Tailwind. Worth extracting into `src/components/ui/` once patterns stabilize further.
- No dark mode.
- No documented accessible-contrast check on the status colors (green/yellow/red-100 backgrounds with 900 text) — visually consistent, not yet audited for WCAG.
- No responsive/mobile breakpoints in use anywhere — app is desktop-only today (fixed `w-64` sidebar, no `sm:`/`md:` prefixes found).
