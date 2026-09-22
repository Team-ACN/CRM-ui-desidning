# EC Pipeline — Schema & Build Reference

This documents what's actually implemented, not the original proposal — it replaces the earlier
draft of this file, which described a schema (pass/fail overall, no `floor`, `error` on
developer/project, a "Push to Live Projects" button) that has since changed. Treat this as the
source of truth for `src/data/mockEc.js` and the two EC pages; if the code and this file ever
disagree, the code wins and this file needs updating.

## 1. What this is

A frontend-only mock of an Environmental Clearance (EC) filing review pipeline inside Edge. EC
filings surface real estate projects before they hit RERA — this pipeline turns a raw filing into
either an update to an existing live Project or a brand-new one, gated by a mix of automated
checks and a manual triage call. There is no real backend: `src/data/mockEc.js` is an in-memory
array acting as the `ec_scrapes` table, and every "automated" stage is actually a button that runs
a small pure function against seed data.

Pages:
- `/ec` — `EcPipelinePage.jsx` — the funnel list view.
- `/ec/:id` — `EcFilingEditorPage.jsx` — the per-filing detail/edit view.

## 2. Schema

```
ec_scrapes
├─ id                  text, e.g. "EC0023" — same id-pattern as Builder (B0001) / Project (P0001)
├─ source              enum [EC, ToR]
├─ sia_id              text — SIA ID / proposal identifier from source
├─ name                text — project name from source
├─ proponent           text — raw proponent name from source
├─ date_of_submission  date
├─ kml_file            text | null — stored KML file URL/path
├─ site_plan           text | null — stored site plan PDF URL/path
├─ added_date          timestamptz
├─ json_data           jsonb — see below
├─ status              jsonb — see below
├─ pushed_project_id   text | null — implementation-only, not part of the real schema. Set once
│                        this filing has been filed as its own new Project (see §5).
└─ _demo               object — implementation-only, not part of the real schema. Stands in for
                         what a real scraper/geometry-match/PDF-search would return; see §7.
```

```
json_data
├─ codename         string | null
├─ units            number | null
├─ floor            string | null    — e.g. "G+20"
├─ land_area_acres  number | null    — stored in acres; the UI's Area field displays/accepts sq. m
│                                       and converts both ways (1 acre = 4046.85642 sq. m)
├─ layout           string[]         — LAYOUT_TYPES: Apartment, Villa, Villament, Row House, Plot,
│                                       Commercial, Offices
├─ config           string[]         — CONFIGURATIONS: Studio, 1BHK, 1.5BHK, 2BHK, 2.5BHK, 3BHK,
│                                       3.5BHK, 4BHK, 4.5BHK, 5BHK, 5.5BHK, 6BHK, 6.5BHK, 7BHK, 7.5BHK
├─ description      string | null
└─ developer_name   string | null    — the matched builder's name (see §4), not the raw proponent
```

```
status
├─ developer   [found, not-found]
├─ project     [yes, no]                     — is this a genuine, trackable real-estate project
├─ kml         [clear, overlap, missing, error]
├─ site_plan   [extracted, manual, partial, missing, error]
└─ overall     [live, new, hold, reject]      — manual triage call. new UNRECORDS as "Removed" in
                                                 the UI (the value is `new` for historical reasons,
                                                 the label is "Removed"). ⚠️ A freshly-scraped filing
                                                 actually starts at overall: 'pending' (see
                                                 blankStatus()) — 'pending' is a real, storable value
                                                 but is deliberately absent from
                                                 OVERALL_STATUS_OPTIONS, so nothing lets you pick it
                                                 from a dropdown; it only shows up as the initial/
                                                 unset state until a human sets Hold/Reject, or
                                                 something pushes it straight to Live/Removed.
```

Enums live as exported option arrays in `src/data/mockEc.js` (`{value, label}[]`), imported by both
pages so the UI never hardcodes a label:

| Export | Values |
|---|---|
| `DEVELOPER_STATUS_OPTIONS` | found, not-found |
| `PROJECT_STATUS_OPTIONS` | yes, no |
| `KML_STATUS_OPTIONS` | clear, overlap, missing, error |
| `SITE_PLAN_STATUS_OPTIONS` | extracted, manual, partial, missing, error |
| `OVERALL_STATUS_OPTIONS` | live, new ("Removed"), hold, reject — **not** pending |
| `LAYOUT_TYPES`, `CONFIGURATIONS` | see json_data above |

## 3. Functions (`src/data/mockEc.js`)

| Function | Does |
|---|---|
| `matchDeveloper(proponent)` | Fuzzy-matches a proponent string against `getBuilders()` (from mockEdge) by normalizing both names (strips Pvt/Ltd/LLP/Group/Properties/Developers/Constructions and non-alphanumerics) and checking substring containment either way. Returns the matched builder object or `null`. |
| `classifyProjectRelevance(name)` | Lowercases the filing name and returns `'no'` if it hits any exclude keyword (see `KEYWORDS`), else `'yes'`. |
| `getEcScrapes()` | Returns all filings, newest `added_date` first. |
| `getEcScrape(id)` | Returns one filing. |
| `updateEcScrape(id, patch)` | Shallow-merges `patch` onto the record; `status`, `json_data`, and `_demo` are merged one level deep (so `updateEcScrape(id, {status: {kml: 'clear'}})` only touches `status.kml`). |
| `runScraper()` | Pops the next item off an internal `incomingQueue` (seeded from `REAL_TEST_LISTINGS`), assigns it a new id, and prepends a blank record (`blankJsonData()` / `blankStatus()`) to `ecScrapes`. Returns the new record or `null` if the queue is empty. |
| `hasMoreIncoming()` | Whether `runScraper()` has anything left to pull — gates the "Run Scraper" button. |
| `pushEcScrapeToProjects(id)` | Maps this filing's `json_data` into `mockEdge.js`'s `blankProject()` shape and calls `createProject()`. Sets `pushed_project_id` on the filing. This is the "file as a brand-new project" path — used both by the (now-removed) old push flow and by the overlap box's "Add new project" button. |

## 4. Developer resolution vs. developer category

Two different things both called "developer" that are easy to conflate:

- **`status.developer` (found/not-found)** — set by `runDeveloperMatch()` in the editor page,
  which calls `matchDeveloper(e.proponent)` and writes the result into `json_data.developer_name`.
  This is what the Pill on the filing-info card shows.
- **Developer *category* (Cat A–D / Unassigned / Blank)** — a derived value that only exists in
  `EcPipelinePage.jsx` (`developerCategoryFor(e)`), used purely for the list page's Developer
  filter. It is **not stored** on the record. Logic:
  - no match / `status.developer !== 'found'` → `'blank'`
  - matched name doesn't correspond to any builder in `getBuilders()` → `'unassigned'` (a data
    gap — shouldn't normally happen since `developer_name` is written from a real builder match,
    but is possible after a manual edit)
  - otherwise → that builder's `category` (`'A'|'B'|'C'|'D'`, from `mockEdge.js`'s
    `BUILDER_CATEGORIES` / `builders[].category`)

## 5. Overlap resolution

When `status.kml === 'overlap'`, `_demo.overlapWith` holds display strings like
`"Sobha Neopolis (P0002)"` — one per clashing project (a filing can clash with more than one).
`overlapProjects(e)` in the editor page regex-parses the project id out of each string
(`/\(([A-Z]\d+)\)/`) and looks the project up via `getProject()` to show its real name and
`builder_name`/`rawBuilderName`. For each match, the UI offers:

- **Update this project** — merges this filing's `json_data` (description, units→total_units,
  floor, layout→layouts, config→configurations, land_area_acres) and `kml_file`→`kml_file_url`
  onto the *existing* live Project via `updateProject()`, instead of creating a duplicate.
- **Add new project** (shown once, below the list, not per-project) — ignores the overlap and
  calls `pushEcScrapeToProjects()` to file this as its own new Project anyway.

`overlapWith` itself is populated only by seed data / `_demo.kmlOutcome` — there's no real overlap
detection, see §7.

## 6. Page walkthrough — exactly what's on screen and what it does

### `/ec` — EcPipelinePage.jsx (the funnel list)

**Header bar** (white, full width)
- Left: back arrow → `/edge/projects`, then breadcrumb "Edge / EC Pipeline".
- Right: a "N Filings" pill showing the total record count, then **Run Scraper**. Clicking it pops
  the next item off the mock incoming queue, inserts it at the top of the list as a brand-new blank
  record, and immediately navigates you into that record's editor page (`/ec/:id`) so you land
  straight into filling it out. It greys out and stops responding once the queue is empty
  (`hasMoreIncoming()` returns false — there's a fixed number of seeded incoming listings).

**Search + filters bar** (white, under the header)
- A search box (placeholder "Search ID, name or proponent...") — matches case-insensitively
  against the filing's id, name, and proponent, live as you type, with an X to clear it.
- A **Filters** toggle button showing a small count badge when filters are active; click to
  expand/collapse the filter grid below it.
- One chip per active filter (search term included) — each has its own X to clear just that one;
  a **Clear all** text link appears once more than one filter is active.
- The expanded filter grid, in this exact left-to-right order:
  1. **Manual Check** — multi-select: Live, Removed, Hold, Reject. (There's no way to filter for
     "Pending" specifically — it's the unset default and isn't one of the pickable options.)
  2. **Developer** — multi-select: Cat A, Cat B, Cat C, Cat D, Unassigned, Blank. This is the
     *category* filter (§4), not found/not-found.
  3. **Project** — multi-select: Yes, No.
  4. **KML** — multi-select: Clear, Overlap, Missing, Error.
  5. **Site Plan** — multi-select: Extracted, Manual, Partial, Missing, Error.
  6. **Sort** — single-select: Added date or Submitted date. Whichever is picked, the list is
     always sorted newest-first; there's no ascending option.
  Every multi-select shows a live `(count)` next to each option, computed against whatever the
  search box currently matches (so counts update as you type, independent of other filters picked).

**Table**
- Header row is sticky while the body scrolls.
- Columns, in order: **ID** (monospace) · **Status** (four small colored circular icons — developer
  / project / KML / site plan, in that order, hover each for its label + raw value) · **Added**
  (DD/MM/YYYY) · **Manual Check** · **Developer** (matched name, or a light-gray "Unmatched") ·
  **Project Name** (title attribute shows the raw proponent on hover). There is **no Actions
  column** — the entire row is clickable and takes you to `/ec/:id`.
- The Manual Check cell: if the filing is still `pending`, it's a clickable colored badge that
  opens a tiny dropdown offering only **Hold** or **Reject** (positioned to flip upward
  automatically if there isn't room below, and rendered via a portal so the table's own scroll
  clipping can't cut it off). Clicking the badge stops the click from also triggering the row's
  navigate-to-editor behavior. Once a filing is anything other than pending, this cell becomes a
  plain, non-interactive colored label — you cannot change it from the list page anymore, and you
  can never set Live or Removed from here at all.
- If the current search/filters produce nothing, the body is replaced with a centered "No filings
  found" empty state.

**Pagination footer** — "showing X–Y of Z", Prev/Next, "Page N of M"; page size is fixed at 20.
Changing the search box, any filter, or the sort order all reset you back to page 1.

### `/ec/:id` — EcFilingEditorPage.jsx (the per-filing editor)

**Sticky header** (stays pinned at the top as you scroll the page)
- Left: "← Back" → `/ec`.
- Right: a Manual Check dropdown — same colored-badge-with-chevron control as the list page, but
  here it's *always* clickable (no pending-only gating) and its options are restricted to **Hold /
  Reject / Pending** only. You cannot set Live or Removed from this page — those are set elsewhere.

**Meta card** (directly under the header)
- Row 1: filing id (bold, monospace) · source pill (EC/ToR) · "Added DD/MM/YYYY" (pushed to the
  right).
- Row 2: SIA id (monospace, left) · "Submitted DD/MM/YYYY" (right).

**Section 1 — Filing Info** (two stacked cards, full width)
- Card 1: "Developer: `<matched name or blank>`" and "Proponent: `<raw proponent>`" stacked on the
  left. On the right: a static Found/Not-found pill (not clickable), a **Run** icon button that
  re-executes `matchDeveloper(proponent)` and writes the result back into `status.developer` /
  `json_data.developer_name`, and a building icon that links out to the Developers table
  (`/edge/project/developers`).
- Card 2: the filing's project name (bold) on the left, a **Yes/No dropdown** on the right — this
  is a direct manual override of `status.project`, no Run button involved (project relevance has
  no automated re-check button in this UI, unlike the other three stages).

**Section 2 — Site Plan** (2nd section; 2/3 + 1/3 layout)
- Left (2/3): the resolved PDF (`site_plan`) rendered inline in an iframe with the browser's
  native PDF toolbar suppressed (`#toolbar=0&navpanes=0`), or — if nothing's resolved yet — a
  centered file icon + "No site plan resolved yet."
- Right (1/3), one card:
  - Top row: an **upload icon** (far left) — manually attaches the (mock) site plan and sets
    status to `manual`, no confirmation dialog, instant. On the far right: the Extracted/
    Manual/Partial/Missing/Error status pill, then a **Run icon** — `runSitePlanSearch()` looks at
    this record's canned `_demo.sitePlanOutcome` and applies it; the *first* time it resolves to
    "extracted" it also back-fills Units/Floor/Area/Layout/Config/Description with sample
    extracted values (it won't overwrite them again on a second run if a description is already
    present).
  - **Area** — a numeric input taking square meters, with a small "= X.XX acres" readout next to
    the field's label that updates live as you type (the record itself stores acres; sq. m is
    purely how this one field displays/accepts input, conversion factor 4046.85642 sq. m/acre).
  - **Units** and **Floor** — two plain fields side by side (Floor is free text, e.g. "G+20").
  - **Layout** — a checklist dropdown (multi-select) of layout types.
  - **Config** — a checklist dropdown (multi-select) of unit configurations.
  - **Save Specs** — full-width button at the bottom. It starts disabled and greyed out; typing
    into Area/Units/Floor or changing Layout/Config (or a Run that back-fills specs) lights it up
    dark. Every one of those fields has *already* written to the record the instant you changed
    it — this button doesn't do any actual saving, it just flashes "Saved ✓" for 1.5 seconds and
    goes back to disabled, as a deliberate confirmation gesture so it's obvious something changed
    and was acknowledged.

**Section 3 — Location / KML** (3rd section; 2/3 + 1/3 layout)
- Left (2/3): a real interactive Leaflet map. A small floating control bottom-left over the map
  toggles Normal (OpenStreetMap) vs. Satellite (Esri World Imagery) tiles. It renders this
  filing's (sample) boundary polygon in green, and — only while `status.kml === 'overlap'` — a
  second sample polygon in red representing the project it clashes with. If there's no KML at all
  yet, a caption under the map says "No KML uploaded yet — showing base map only."
- Right (1/3), stacked cards:
  - Card A: top row = an **upload icon** (manually attaches a mock KML and clears the status to
    `clear`) and a **copy icon** (copies this filing's sample lat/long to the clipboard, flashes a
    checkmark for 1.5s) on the left; the Clear/Overlap/Missing/Error status pill and a **Run icon**
    (`runKmlCheck()`, applies this record's canned `_demo.kmlOutcome`) on the right. Below that
    row: the **Codename** field (a free-text internal short name).
  - Card B (only appears while `status.kml === 'overlap'`): one row per clashing project — the
    matched project's developer name and id (e.g. "Sobha Limited (P0002)"), then a full-width
    **Update this project** button underneath. Clicking it pushes this filing's specs (units,
    floor, layout, config, area, description) and KML file onto that *existing* live project
    record via `updateProject()` — it does not touch this filing's own record. Below all such
    rows, one more full-width dark **Add new project** button — this ignores every match above and
    instead files the current EC filing as a brand-new Project via `pushEcScrapeToProjects()`.

Nothing on this page has a page-level "Save" — every field commits to the mock record as soon as
you change it (`updateEcScrape` is called on every keystroke/selection). The only two buttons that
look like save actions (**Save Specs**, and the overlap box's action buttons) are confirmations /
one-shot pushes to a *different* record, not gates on this filing's own data.

## 7. Mock-simulation caveats (not part of the real schema/behavior)

- **`_demo`** on each seed record (`kmlOutcome`, `overlapWith`, `sitePlanOutcome`) is what the
  Run buttons read to decide what "the scraper/geometry-match/PDF-search would have found" — it
  stands in for a real backend result and should be deleted once one exists.
- **KML rendering** is illustrative: every filing is deterministically assigned one of two bundled
  sample boundary files (`public/kml-samples/plot-a.kml` / `plot-c.kml`, chosen by
  `parseInt(id.slice(2)) % 2`), and an "overlap" always renders against the same third file
  (`plot-b.kml`) — none of this reflects the filing's real geometry.
- **Site plan PDFs**: every "extracted"/"manual" filing points at the single real uploaded file,
  `public/site-plans/goyal-hariyana-orchid-greens.pdf` — there's only one real PDF in the mock, and
  the same file is reused everywhere a site plan needs to render as something.
- **`pushed_project_id`** and **`_demo`** live on the in-memory record but are explicitly called
  out above as not part of the documented `ec_scrapes` schema — don't carry them into a real table.
