# PRD — ACN Popup System (CMS module)

**Owner:** Samarth · **Status:** Built (UI prototype, mock data) · **Surface:** ACN CRM → CMS → Popups
**Branch:** `feat/popup-cms` · **Last updated:** 2026-09-08

---

## 1. Summary

A config-driven popup system authored inside the existing CMS. The creative is a single uploaded image; the system renders the CTA buttons, the close control and the backdrop around it. An author uploads the image, picks a layout, writes the button labels and colours, chooses where and how often it fires, and sends it for approval — no deploy.

**App and web are separate products here.** A popup belongs to exactly one surface, has one creative shaped for that surface, renders with a different anatomy on each, and is ranked only against popups on the same surface.

This document describes what was built: anatomy, data model, every validation rule, both colour algorithms, the metric formulas, and the backend contract the UI assumes.

### What is in scope (built)

- Popups list grouped by trigger context, per surface, with per-surface performance panels
- Builder: canvas + single settings column (creative → action area → placement → delivery)
- Automatic action-area colour matched to the poster
- WCAG contrast guard on every button label
- Priority + approval on one screen, two-step (drag, then save)
- The app's built-in delist popup represented as an app-managed record
- Preview modal with configuration and performance summary

### What is not in scope

- No backend. All state is React state over `src/data/mockPopups.js`; nothing persists across reload.
- No text/layout editor — the image carries the design.
- No counting triggers ("N enquiries in 1 day") — needs aggregation infra.
- No A/B variants, no conversion attribution beyond the click, no audit log.
- No web anatomy from design yet — web renders the older centred-card model (see §14).

---

## 2. Surface model

| | App | Web |
|---|---|---|
| Record field | `surface: 'app'` | `surface: 'web'` |
| Creative field | `imageUrl` — 39:50 poster | `imageUrlDesktop` — 4:3 landscape |
| Min upload | 780 × 1000 | 1440 × 1080 |
| Anatomy | Bottom sheet (§3.1) | Centred card (§3.2) |
| Preview frame | Phone, with ACN app header | Desktop browser chrome |
| Competes with | Other app popups on the same trigger | Other web popups on the same trigger |

There is no "both" surface and no "all" filter. The list shows one surface at a time; the stats panels show both side by side so the other surface is never hidden, and clicking the inactive panel switches the view.

---

## 3. Anatomy

### 3.1 App — bottom sheet

Built to the mobile spec (Figma `Popup designs`, node `163:1764`). Geometry is authored at 390pt and scaled linearly by the render width.

```
        ( × )                    36pt close chip, centred, 12pt above the sheet
┌───────────────────────┐
│                       │
│   POSTER  390 × 500   │        39:50, edge to edge, object-cover
│                       │
├───────────────────────┤        ← no seam: action colour == poster bottom edge
│  ✦ ── TRY IT YOURSELF ── ✦ │   divider row, 300pt wide, 21pt tall
│  [   Button label    ]│        354pt wide, 48pt tall, radius 8
│  [   Button label    ]│        11pt gap between buttons
│         ▁▁▁▁          │        home indicator, same colour
└───────────────────────┘
```

| Element | Spec |
|---|---|
| Backdrop | `rgba(0,0,0,{backdropOpacity})`, default 0.6, covers the whole screen including the app header |
| Close chip | 36pt circle, white 90%, centred horizontally, 12pt above the sheet |
| Poster | 39:50 (`POSTER_ASPECT`), full bleed |
| Action area | Solid `actionBarColor`, 12pt top padding, side padding 18pt |
| Divider label | Inter Medium 14 / 1.5, letter-spacing 0, `#E5E5E5`; text authored, font fixed |
| Divider rule + star | 1px `#E5E5E5` rule, 12pt star (`DividerStar.jsx`, exported from Figma node `163:1809`), stars sit adjacent to the label |
| Buttons | 354pt wide, 48pt tall, radius 8, Inter Medium 16, stacked, 11pt apart, drop-shadow `0 4 6 rgba(0,0,0,.25)` |
| Home indicator | 139 × 5pt, on the same solid colour |
| Dismissal | Close chip, or swiping the poster down |
| Toast | Authored text, shown after a CTA tap, above the sheet (§7) |

Inter is loaded in `index.html` so the CMS preview renders in the app's real typeface.

### 3.2 Web — centred card

Centred 4:3 card over a dimmed page. Buttons are drawn **over the artwork**, positioned as a % of the card from the template registry, sitting in an empty "well" the designer leaves in the image. A close button sits in `closeCorner` with a reserved zone (`CLOSE_ZONE_PCT` = 14% × 11%) so `full_tap` never swallows it.

---

## 4. Template registry

Layout geometry lives in code (`popupTemplates.js`), never in the record. Adding a layout is one registry entry plus one design template.

| `templateKey` | Label | Buttons | App behaviour | Web slots (% of card) |
|---|---|---|---|---|
| `full_tap` | No button | 0 | Poster itself is the link | none; whole card tappable minus close zone |
| `single_button` | One button | 1 | One CTA in the action area | `x 8, y 78, w 84, h 9` |
| `two_button` | Two buttons | 2 | Two CTAs stacked | `x 8 / 51.5, y 78, w 40.5, h 9` |

Switching template preserves button config for slots the new template still has and fills new slots from `buildDefaultButtons` (primary `#047857` on white text, secondary `#1F2937`).

---

## 5. Data model

One flattened record per popup (`src/data/mockPopups.js`). A real backend would split this into `popup`, `popup_button`, `trigger_rule`, `frequency_policy`.

```js
{
  id: 'POP001',
  name: 'Whitefield Premium — Book a demo',

  // Ownership
  managedExternally: false,   // true = built into the app; only priority is editable here
  externalNote: '',           // shown in place of the preview for app-managed popups

  // Surface + creative
  surface: 'app',             // 'app' | 'web'
  imageUrl: '<data or url>',  // app poster (39:50) — required for app
  imageUrlDesktop: '',        // web creative (4:3) — required for web
  templateKey: 'single_button',
  backdropOpacity: 0.6,
  closeCorner: 'top_right',   // web only

  // App action area
  actionBarColor: '#065F46',
  matchPosterColor: true,     // when true, actionBarColor is sampled from the poster
  dividerLabel: 'TRY IT YOURSELF',
  toastMessage: '',           // ≤ 80 chars, shown after a CTA tap; empty = no toast

  // Lifecycle
  status: 'Live',             // 'Draft' | 'Not Live' | 'Live' | 'Off'
  isActive: true,             // mirrors status === 'Live'
  priority: 1,                // 1 = highest, within its (surface, trigger) group

  // Targeting
  cohortIncludeIds: ['COH001'],  // 0 or 1 entry — "All users" when empty
  cohortExcludeIds: [],          // reserved; no UI today

  // Buttons
  buttons: [{
    id: 'POP001-b0',
    slotIndex: 0,
    label: 'Book a demo',
    bgColor: '#047857',
    textColor: '#FFFFFF',
    redirectUrl: 'https://acn.example.com/demo',
    openInNewTab: false,      // in the model, not author-editable
    analyticsKey: 'book_demo',
  }],

  // Trigger — exactly one
  trigger: {
    type: 'session',          // 'session' | 'page' | 'scroll' | 'event'
    pageKey: null,            // required for page/scroll
    scrollDepthPct: null,     // required for scroll, 1–100
    eventKey: null,           // required for event
  },

  // Frequency
  frequency: { maxImpressions: 2, cooldownHours: 48, minGapHours: 12 },

  // Rolled-up counters (server-owned in production)
  stats: {
    impressions: 12840,
    closes: 7620,
    buttonClicks: { book_demo: 1932 },   // keyed by analyticsKey
    byDevice: { mobile: 12840, desktop: 0 },
  },
}
```

**Enums** (`popupConstants.js`): page keys `home | properties | my_business | service`; event keys `add_inventory_success | enquiry_submitted | profile_completed`; statuses `Draft | Not Live | Live | Off`.

**Defaults on create:** surface = the surface being viewed, `templateKey: 'single_button'`, backdrop 0.6, close corner top-right, `matchPosterColor: true`, divider `TRY IT YOURSELF`, `frequency: { maxImpressions: 1, cooldownHours: null, minGapHours: null }`, `priority: 999`, status `Draft`.

**Image constraints:** PNG / JPEG / WebP, ≤ 2 MB. Below-minimum dimensions are a warning, not a block.

---

## 6. Authoring flow

The builder is a canvas plus one scrolling settings column. Name sits at the top of the column; everything is on one side.

| Step | Fields |
|---|---|
| **Name** | Popup name |
| **1 · Surface & creative** | Surface (App / Web) → creative upload for that surface → layout (No button / One button / Two buttons) |
| **2 · Action area** (app) / **Buttons** (web) | Divider label, action-area colour (auto-matched), per button: label, background, text colour, contrast readout, redirect URL, analytics key; toast message |
| **3 · Where it shows** | Trigger type, page key, scroll depth, event key, audience (one searchable cohort dropdown) |
| **4 · How often** | Max shows, cooldown (h), min gap (h), plain-English summary |

Canvas controls: surface chip (App/Web), **Show guides** (outlines the poster block, the button slots and the reserved close zone so the artwork can be checked against them), and **Toast** (app only — previews the post-CTA toast).

Header actions: **Save draft** (needs a name only) and **Send for approval** (needs a fully valid record). An amber "*N* to fix" chip lists blocking issues on hover.

---

## 7. Toast

Authored as **text**, not an image. Max 80 characters, with a live counter. Empty means no toast. Rendered by the system: 354pt wide, `rgba(23,23,23,0.95)`, white Inter Medium 14, radius 12, drop shadow — positioned **above the sheet** so it never covers the CTA that fired it. One toast per popup, fired by any CTA tap.

---

## 8. Colour logic

### 8.1 Action-area colour sampling (`sampleImageColor.js`)

The action area must continue the poster so the sheet reads as one surface. The colour is read off the artwork rather than typed in.

1. Load the poster with `crossOrigin = 'anonymous'`; bail to `null` on error.
2. Draw it into a canvas capped at 240 × 240 px (cheap, and averaging is unaffected).
3. Take a strip of the **bottom 4% of rows**, spanning the **middle 60% of the width** — corners and outer edges carry rounding and vignetting that drag the average off-colour.
4. Average R, G and B across that strip; round each channel and format as `#RRGGBB`.
5. On a tainted canvas (cross-origin image without CORS headers) log and return `null`; the existing colour is kept.

Triggered automatically whenever `imageUrl` changes while `matchPosterColor` is true, and on demand via **Match poster**. **Set manually** flips `matchPosterColor` to false and hands over a colour picker.

### 8.2 Contrast guard (`contrast.js`)

Standard WCAG 2.1 relative luminance and contrast ratio, applied to every button's label-on-background pair.

```
channel c' = c/255 ≤ 0.03928 ? (c/255)/12.92 : (((c/255)+0.055)/1.055)^2.4
L          = 0.2126·R' + 0.7152·G' + 0.0722·B'
ratio      = (L_lighter + 0.05) / (L_darker + 0.05)
```

| Ratio | Level | Effect |
|---|---|---|
| ≥ 7 | AAA | Pass, shown grey |
| ≥ 4.5 | AA | Pass, shown grey |
| < 4.5 | Fail | Red inline readout + a validation **warning** (does not block saving) |

The default primary colour is `#047857` (5.48:1 on white), chosen because emerald-600 `#059669` fails at 3.77:1.

---

## 9. Targeting and triggers

One trigger per popup. Required fields by type:

| Type | Requires | Fires |
|---|---|---|
| `session` | — | First authenticated load of a session |
| `page` | `pageKey` | On landing on that page |
| `scroll` | `pageKey`, `scrollDepthPct` (1–100) | When the user passes that scroll depth on that page |
| `event` | `eventKey` | After the named action succeeds |

**Audience:** one searchable dropdown — "All users" (default) or a single cohort, stored as `cohortIncludeIds: [id]`. Exclusions exist in the model but have no UI.

---

## 10. Priority and grouping

### Grouping key

`groupPopupsByContext` buckets popups by `surface | trigger.type | pageKey|eventKey | scrollDepthPct`. That bucket is the competition: only one popup can show per view, so ranking only means anything inside it.

Group order: surface (app, then web) → trigger type (`session`, `page`, `scroll`, `event`) → label alphabetically. Within a group, ascending `priority`.

### Two-step ranking

Ranking never changes from the list — a stray drag must not reshuffle live traffic. **Manage priority** opens a dedicated screen, scoped to the current surface:

- Drag handles reorder within a group; ordering is local state.
- **Save & apply** is disabled until the order actually differs from the stored order, then writes `priority = index + 1` per group.
- **Cancel** discards.
- Status controls on this screen are live, not deferred: rows render the latest record so an approval repaints immediately while ordering stays uncommitted.

---

## 11. Status lifecycle and approval

```
Draft ──save & send──▶ Not Live ──approve──▶ Live ⇄ Off
```

| Status | Meaning | Where it changes |
|---|---|---|
| `Draft` | Incomplete or parked | Builder → Save draft |
| `Not Live` | Complete, waiting on review | Builder → Send for approval |
| `Live` | Serving | Priority screen → Preview to activate → **Approve & Make Live** |
| `Off` | Manually stopped | List row menu → Turn off, or the priority screen's Live/Off button |

Approval lives only on the priority screen (mirroring Templates). The list row menu offers Preview, Edit and Turn on/off. App-managed popups (`managedExternally`) expose Preview only — no edit, no status toggle — and show a lock note instead of a creative preview.

---

## 12. Metrics — definitions and formulas

All metrics derive from `popup.stats`, which a backend owns in production. `safeDivide` returns **0** whenever the denominator is 0, so an unlaunched popup reads 0.0% rather than `NaN`.

### 12.1 Inputs

| Counter | Definition | Emitted when |
|---|---|---|
| `impressions` | Times the popup rendered | Popup becomes visible |
| `closes` | Times the popup was dismissed | Close chip, backdrop tap, or swipe-down |
| `buttonClicks[analyticsKey]` | Clicks per CTA, keyed by the author's analytics key | CTA tapped, before the redirect |
| `byDevice` | Impressions split by device | Alongside each impression |

### 12.2 Per-popup formulas

| Metric | Formula | Notes |
|---|---|---|
| Total clicks | `Σ buttonClicks[*]` | Sums every CTA on the popup |
| **CTR** | `total clicks ÷ impressions` | Can exceed 100% if one impression yields taps on both CTAs — it is clicks per impression, not clickers per impression |
| **Dismiss rate** | `closes ÷ impressions` | A CTA tap is not a close, so CTR + dismiss rate need not reach 100% |
| Per-button clicks | `buttonClicks[button.analyticsKey]`, defaulting to 0 | Missing key ⇒ 0, never an error |
| Per-button CTR | `button clicks ÷ impressions` | Comparable across buttons of one popup |
| Share of clicks | `button clicks ÷ total clicks` | Splits attention between the two CTAs; 0 when there are no clicks |

An unmatched `analyticsKey` (renamed after data was collected) silently reads 0 — historic clicks stay in `stats` but stop being attributed. Treat renaming a live key as starting a new series.

### 12.3 Per-surface aggregates (the two stats panels)

Computed over every popup on that surface — not just the filtered or searched rows.

| Panel metric | Formula |
|---|---|
| **Live** | count of popups with `status === 'Live'` |
| **Impressions** | `Σ impressions` |
| **Avg CTR** | `(Σ clicks) ÷ (Σ impressions)` |
| **Dismiss** | `(Σ closes) ÷ (Σ impressions)` |

"Avg CTR" is a **ratio of sums, not an average of ratios** — a popup with 12,840 impressions counts proportionally more than one with 940. This is deliberate: an average of per-popup CTRs would let a tiny popup swing the surface number.

### 12.4 Formatting

- Counts: `toLocaleString('en-IN')` → `12,840`, `1,20,000` at lakh scale.
- Percentages: one decimal → `15.0%`, `46.3%`.
- Zero-traffic popups show "No data yet" in the list instead of `0 · 0.0%`.
- All numeric cells use tabular figures so columns align.

---

## 13. Backend contract

The UI assumes two endpoints. Neither exists yet; the shapes below are what the client is written against.

### `GET /popups/eligible?surface=&page=&user=`

Returns the winning popup for the context, plus any scroll-triggered popups for that page (pre-fetched so they fire without a round trip). The server must run these gates **in order** and stop at the first failure:

1. **Live + schedule** — `status === 'Live'`.
2. **Surface + trigger** — popup's surface equals the request surface; trigger type matches, and `pageKey` / `eventKey` / scroll threshold match.
3. **Cohort** — user is in an included cohort (or the popup has none), and in no excluded cohort.
4. **Frequency / suppression** — from per-user state: not dismissed, not completed, `impressionCount < maxImpressions`, hours since `lastShownAt` ≥ `cooldownHours`, and ≥ `minGapHours` since any popup.
5. **Priority** — lowest `priority` number among survivors wins; everything else is suppressed for that view.

Per-user state the server must keep: `{ user_id, popup_id, impression_count, last_shown_at, dismissed_at, completed_at }` — server-side, because an agent uses ACN on phone and desktop and a dismissal must persist across both.

### `POST /popups/events`

Ingests `impression | cta_click | close`, carrying `popup_id`, `button_id` / `analytics_key`, `user_id`, `surface`, `page_key`, `device`, `created_at`. These are the counters §12 reads back.

---

## 14. Open questions

1. **Web anatomy.** Only the mobile design exists. Web still renders the older centred-card model with buttons over the artwork's well. If web should adopt the poster + action-area anatomy, the registry and `PopupOverlayPreview` change.
2. **Toast design.** Node `170:614` carries the note but no toast frame; the current styling is a system default. A design would replace it.
3. **Event keys.** Only `add_inventory_success` is confirmed; the other two are placeholders until the client exposes the callbacks.
4. **App route keys.** Assumes `home | properties | my_business | service`; needs confirming against the real app navigation.
5. **Image limits.** 780×1000 / 1440×1080 / 2 MB are working figures.
6. **Multi-cohort targeting.** The dropdown is single-select today; the field is an array, so multi-select is additive.
7. **Counting triggers** ("N enquiries in 1 day") remain deferred — they need a scheduled job flagging eligible users into a table the eligibility API reads.

---

## 15. File map

```
src/data/mockPopups.js                  8 seeded popups incl. the app-managed delist popup

src/components/Popups/
  popupConstants.js       enums, image limits, sheet defaults, label helpers
  popupTemplates.js       layout registry: aspect, buttonCount, web slot geometry
  popupValidation.js      validatePopup + describeTrigger / describeFrequency / describeTargeting
  contrast.js             WCAG luminance + ratio + level
  sampleImageColor.js     poster bottom-edge colour sampling
  popupStats.js           every metric in §12
  groupPopups.js          trigger-context grouping + ordering
  usePopups.js            state hook: save, setStatus, toggleLive, reorderPriority, createEmptyPopup

  PopupsTab.jsx           screen: stats panels, toolbar, grouped list, preview modal
  PopupsToolbar.jsx       surface switch, search, Manage priority, New popup
  PopupGroup.jsx          one trigger-context group
  PopupRow.jsx            list row
  StatusChip.jsx          the one status vocabulary
  RowMenu.jsx             row overflow menu
  PopupPriorityManager.jsx  two-step ranking + approval
  PopupViewModal.jsx      preview + configuration + performance

  PopupBuilder.jsx        builder shell, template remap, colour sampling trigger
  PopupCanvas.jsx         device frame, guides toggle, toast toggle
  PopupSheetPreview.jsx   app bottom sheet renderer (§3.1)
  PopupOverlayPreview.jsx web card renderer (§3.2)
  DesktopFrameMock.jsx    browser chrome mock
  DividerStar.jsx         exported Figma star
  ImageUploadField.jsx    upload + type/size/dimension checks
  ColorField.jsx          swatch + hex input
  CohortSelect.jsx        searchable audience dropdown
  settings/Section.jsx    numbered section wrapper
  settings/CreativeSection.jsx | ButtonsSection.jsx | PlacementSection.jsx | DeliverySection.jsx

src/components/Cohorts/CohortsPage.jsx  hosts the Popups tab + builder/priority routing
index.html                              loads Inter for the app preview
```

---

## 16. Verification performed

- `npm run build` → exit 0.
- `npx eslint src/components/Popups src/data/mockPopups.js` → 0 problems. (`CohortsPage.jsx` still reports one pre-existing `handlePrioritySave` unused-var error that predates this work.)
- Manual walkthrough in Chrome: create and edit popups on both surfaces; layout switching; colour sampling (`#04352A` → `#065F46`, matching the poster fill); contrast pass and fail states; toast text preview; guides overlay; audience search; save → Not Live → approve → Live; per-group ranking with Save & apply gated on a real change; app-managed popup restricted to Preview.
- Not exercised by automation: drag-reorder (synthetic instant drags do not satisfy dnd-kit's pointer-move constraint — the same limitation applies to the existing Templates priority screen) and the file-upload path.
