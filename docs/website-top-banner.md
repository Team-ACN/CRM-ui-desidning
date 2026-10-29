# Website Top Banner (Hero) — CMS

_As of 2026-10-05 · Commit `ae61182` (branch `feat/cms-apple-redesign`, merged into `develop`)_

Website templates in the CMS now always carry a full-width Top Banner hero image. It is managed per template and must be uploaded before the template can be saved.

## Design spec

The banner follows the Figma "Banner designing guide" (Home-Page file, node `10128:12526`): a 1440×378 image with a 600×378 safe area on the right.

| Rule | Value |
| --- | --- |
| Banner size | 1440 × 378 px |
| Safe area | 600 × 378 px, right side |
| Right padding of safe area | 120 px on desktop, 32 px on smaller screens |
| Crop on smaller screens | Image stays right-anchored; the left side crops away |
| Accepted formats | JPG, PNG, WebP |
| Recommended max file size | 2 MB |

Text, logos and CTAs inside the image must sit within the safe area so they survive every crop. The site header and search box overlay the image, matching the Figma hero (node `10120:11279`).

## How it works in the CMS

- **Website only.** The widget exists only for the Website page type. Home and Properties templates are unchanged.
- **Added by default.** Every new Website template opens with the Top Banner already in the first slot. Existing Website templates get it added when opened for editing.
- **Cannot be removed or duplicated.** It has no remove button, is hidden from the widget library, and a second one cannot be dropped in.
- **Always first.** It renders as the hero behind the header, separate from the draggable body widgets, so it can't be reordered.
- **Mandatory to save.** The builder header shows a "Top Banner" step next to Name, Cohorts and Widgets. It is done only when a hero image is uploaded. "Save draft" and "Submit for review" stay disabled until every step is done, and the save handler also refuses to save if a step is missing.
- **Widgets step excludes the banner.** "Widgets" still needs at least one body widget; the auto-added banner doesn't count toward it.

## Banner settings panel

Clicking the hero on the canvas opens its settings in the right panel:

1. **Spec box** — size, formats, max size, and the safe-area rule in plain words.
2. **Preview** — the uploaded image with the safe area outlined. A Desktop / Tablet toggle shows how the left side crops (Tablet preview is 803 px wide, matching the Figma tablet frame).
3. **Upload / Replace / Remove** — reads the file and its pixel dimensions in the browser.
4. **Validation (warn only)** — the image is always accepted, but a warning appears when:
   - the file type isn't JPG/PNG/WebP,
   - the file is over 2 MB,
   - the aspect ratio is more than 2% off 1440:378 ("it will be cropped"),
   - or the ratio is right but narrower than 1440 px ("may blur on large screens").
   A matching image shows "1440×378 · matches spec".
5. **Click-through URL** (optional) and **Alt text**.

The "Section heading" field used by other widgets is hidden for the banner.

## Website canvas preview

- **Header matches Figma** (node `10120:11296`): ACN logo; tabs My Business, Properties, Services ▾, Edge ▾; "+ Add Property" button, coins pill (100), bell, avatar. A dark top fade keeps the white text readable on any image.
- **Hero** is the banner image at 1440:378, right-anchored. Before upload it shows a grey placeholder: "Upload a 1440×378 hero image in widget settings".
- **Search box** overlaps the bottom edge of the hero; body widgets start below it.
- **Removed:** the dark ticker strip ("2BHK in Sobha Dream Acres…"), the blue gradient hero, and the "Search best inventories…" headline.

## Data model

Widget definition (`src/data/mockCohorts.jsx`, `availableWidgets`):

```js
{
  type: 'top_banner',
  label: 'Top Banner (Hero)',
  pageTypes: ['WEBSITE'],
  singleton: true,   // one per template
  isDefault: true,   // auto-added, not in library, not removable
  hasConfig: false,  // configured directly, not via a saved Component
}
```

Widget instance config stored on the template:

```js
{
  id: 'w-hero-…',
  type: 'top_banner',
  config: {
    imageUrl: 'data:image/png;base64,…', // prototype: data URL from the browser
    imageMeta: { type, size, width, height },
    linkUrl: 'https://…',  // optional
    altText: '…',
  },
}
```

## Files changed

| File | What it does |
| --- | --- |
| `src/components/Cohorts/topBannerSpec.js` | Spec constants, `getTopBannerWarnings()`, `readImageFile()` |
| `src/components/Cohorts/TopBannerSettings.jsx` | Settings panel: spec box, preview, upload, warnings, link, alt text |
| `src/data/mockCohorts.jsx` | `top_banner` widget definition |
| `src/components/Cohorts/TemplateBuilder.jsx` | Seeds the banner for Website templates, blocks removal/duplicates, "Top Banner" save step, save guard |
| `src/components/Cohorts/WebsiteCanvas.jsx` | Figma header (`WebsiteNav`), hero rendering, ticker and gradient removed |
| `src/components/Cohorts/WidgetSettingsPanel.jsx` | Routes `top_banner` to its panel, hides Section heading |
| `src/components/Cohorts/WidgetLibrary.jsx` | Filters widgets by page type and hides default widgets |
| `src/components/Cohorts/WidgetInner.jsx` | Small banner thumbnail preview |

## Open questions and follow-ups

- **Widget limit:** the banner takes one of the 5 widget slots, leaving 4 body widgets on Website templates. Should it be excluded from the limit?
- **Image storage:** the prototype stores the image as a browser data URL. Production needs a real upload (storage/CDN URL) and server-side validation.
- **Search box:** still the old layout. Figma has Resale / Rental / Commercial tabs with Explore, Asset Type, Budget and BHK/Size fields.
- **Fonts:** Outfit isn't loaded in the project, so the canvas header falls back to a serif font.
- **Mobile crop:** only desktop and tablet (803 px) previews exist; a phone-width preview may be needed.
