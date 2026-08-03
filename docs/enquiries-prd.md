# PRD — Enquiries Tab

**Status:** UI built (mock data), backend pending
**Owner:** _TBD_
**Last updated:** 2026-08-03

---

## 1. Summary

The Enquiries tab is the operations console for buyer enquiries raised against listed properties. A buyer (or an agent on a buyer's behalf) enquires about a property; the internal team then contacts the seller, records the outcome, and logs feedback and notes against that enquiry.

Today this happens outside the CRM. The Enquiries tab brings the full list, its status lifecycle, and the follow-up trail into one screen.

## 2. Problem

- No single place to see which enquiries came in and which ones were acted on.
- No record of whether the seller was contacted, or whether the property is still available.
- Follow-up context lives in personal chats — lost when someone changes desk.
- No way to slice the day's workload ("what came in today that I haven't touched").

## 3. Goals

1. One list of all enquiries, scannable at a glance.
2. Let the team move an enquiry through its status lifecycle in-place, without opening a detail page.
3. Capture outcome per enquiry — contacted, property availability, feedback, internal notes.
4. Make "today's work" one click away from the top-line numbers.

### Non-goals

- Buyer-facing views. This is internal-only.
- Assigning enquiries to owners / round-robin routing.
- Notifications, reminders, SLA timers.
- Bulk actions.

## 4. Users

| User | Needs |
|---|---|
| KAM / ops executive | Work the daily queue: contact sellers, set status, log notes |
| Ops lead | See volume and conversion at a glance, spot untouched enquiries |

## 5. Screen layout

Top to bottom:

1. **Header** — page title, search box, `Add Enquiry` button.
2. **Stat cards** — four KPIs, each split into Overall / Today tiles, clickable as filters.
3. **Filter bar** — deal type toggle, reset, six dropdown filters, date filter.
4. **Table** — the enquiry list, with pagination footer.
5. **Row panels** — notes drawer, call drawer, and sold modal, each opened from a row.

### 5.1 Stat cards

| Card | Meaning |
|---|---|
| Enquiries | Total enquiries in scope |
| Agents Enquired | Distinct agents who raised enquiries |
| Contacted | Enquiries where the seller was contacted |
| Not Available Marked | Enquiries whose property is no longer available — `Hold` or `Sold` |

All four are split cards with two tiles — `Overall` and `Today`:

- `Overall` recomputes against whatever the filter bar currently has selected.
- `Today` always shows today's unfiltered count, so it stays a fixed reference point no matter what is filtered.

Behavior: clicking a tile filters the list to that card's dimension — the `Today` tile also applies the Today date filter, the `Overall` tile clears the date filter. Clicking the active tile again clears back to defaults. Editing any filter by hand deselects the card.

### 5.2 Filter bar

- **Resale / Rental** toggle.
- **Reset** — clears everything back to defaults.
- **Enquiry Status** — Site Visit Done / Pending / Not Interested (same set as the row status dropdown).
- **Contacted** — Contacted / Not Contacted.
- **Property Status** — Available / Not Available (the read-only column).
- **Current Property Status** — Available / Hold / Sold.
- **Buyer KAM** — list of KAMs.
- **Seller KAM** — list of KAMs.
- **Date of Enquiry** — presets (Today, Last 7 days, Last 30 days, This year) plus a custom from–to range.

All filters are single-select and toggle off when the selected option is picked again.

### 5.3 Table

Columns, left to right:

| Column | Notes |
|---|---|
| Property ID | |
| Property Name | Truncated; full name on hover |
| Buyer Name | |
| Buyer Number | |
| Buyer KAM | Account manager on the buyer side |
| Seller Name | |
| Seller Number | |
| Seller KAM | Account manager on the seller side |
| Date of Enquiry | |
| Status | Editable dropdown, colour-coded — the enquiry's own status |
| Contacted | Read-only indicator |
| Property Status | Read-only — whether the property was marked unavailable on this enquiry |
| Current Property Status | Editable dropdown, colour-coded — where the property stands right now |
| Actions | Pinned to the right edge; `Add Feedback` pill + two icon buttons (call, notes) |

Behavior:

- The table shell stays fixed; only the rows scroll. Column header stays pinned while scrolling vertically; the Actions column stays pinned while scrolling horizontally.
- Uniform row height, consistent with the Agents table.
- Pagination sits below the scroll area and never scrolls away.

### 5.4 Status dropdowns

Two separate columns, same dropdown component, both colour-coded so the column is scannable at a glance. The cell itself takes the colour of the selected value.

**Status** — where the enquiry itself stands:

| Status | Colour |
|---|---|
| Site Visit Done | Green |
| Pending | Yellow |
| Not Interested | Red |

**Current Property Status** — where the property stands right now:

| Status | Colour |
|---|---|
| Available | Green |
| Hold | Yellow |
| Sold | Red |

Selection is per-row and immediate — no save step — with one exception: picking `Sold` opens the sold modal (§5.7), because a sale carries extra detail. The status only changes if that modal is confirmed.

There are **two** property-status columns, and they answer different questions:

| Column | Question | Editable |
|---|---|---|
| Property Status | Was this property marked unavailable while working this enquiry? | No |
| Current Property Status | What is the property's state today? | Yes |

The `Not Available Marked` stat card and the `Property Status` filter both read the **old** column. `Current Property Status` has its own filter.

### 5.5 Notes drawer

Opens from the notes action on a row. Right-side panel over a dimmed page.

Notes are kept **per contact**, not per enquiry — a note about the buyer and a note about the seller are separate threads.

Contents:

- **Header** — enquiry ID, property name, property ID.
- **Numbers** — the same buyer / seller picker as the call drawer (§5.6), with a note count badge per contact. Selecting a contact switches which thread is shown.
- **Internal Notes** — free-text box plus `Add Note`, scoped to the selected contact. Disabled until text is entered.
- **Notes** — log of that contact's notes, each timestamped. Empty state: "No notes added yet".
- **Footer** — `Close`.

The row's notes icon tooltip shows the combined count across both contacts.

Closes on the X, the Close button, clicking the dimmed backdrop, or Esc.

### 5.6 Call drawer

Opens from the phone action on a row. Right-side panel, same shape as the notes drawer.

An enquiry has **two callable numbers** — buyer and seller — so the drawer handles both:

- **Header** — avatar initial, property name, enquiry ID.
- **Numbers** — one row per party (Buyer, Seller) showing role, name, and number, each with its own copy button. Tapping a row selects it; the selected row is outlined. A saved result shows as a small badge on its row.
- **Call Result** — belongs to the selected number. Connection Status radios (Connected / Not Connected / Call Back) plus optional notes. Switching between numbers keeps each one's entry, so both can be logged in one visit.
- **Footer** — `Clear All` wipes both entries; `Save Call Result` saves both and closes. Disabled until at least one status is picked.

Closes on the X, the backdrop, or Esc.

### 5.7 Sold modal

Opens when `Sold` is picked in the Property Status column. Centred modal, not a drawer — it is a short confirm-style form, not a workspace.

- **Header** — `Update Inventory Status`, with the property name and ID beneath.
- **Status** — dropdown, tinted to match the selected status. Pre-set to `Sold`, but can be changed here before confirming.
- **Sold Price (Optional)** — amount in lakhs.
- **Selling Platform (Optional)** — searchable select over the known platform list.
- **Notes (Optional)** — free text.
- **Footer** — `Cancel` leaves the row's status untouched; `Update` applies the status and stores the sale details.

Reopening a row that was already marked sold restores the previously entered details. Closes on Cancel, the backdrop, or Esc.

## 6. Data model (draft)

Enquiry:

| Field | Type | Notes |
|---|---|---|
| `id` | id | Internal |
| `enqId` | string | Human-facing, e.g. `ENQ1001` |
| `propertyId` | string | |
| `propertyName` | string | |
| `sellerName` | string | |
| `sellerNumber` | string | |
| `buyerName` | string | |
| `buyerNumber` | string | |
| `sellerKam` | user | KAM owning the seller |
| `buyerKam` | user | KAM owning the buyer |
| `dateOfEnquiry` | date | |
| `status` | enum | Site Visit Done / Pending / Not Interested |
| `contacted` | bool | |
| `propertyStatus` | enum \| null | `Not Available` or unset — availability marked against this enquiry |
| `currentPropertyStatus` | enum | Available / Hold / Sold — the property's live status |
| `feedbackAdded` | bool | |

Note (child of enquiry):

| Field | Type |
|---|---|
| `id` | id |
| `enquiryId` | id |
| `party` | enum — buyer / seller |
| `text` | string |
| `createdAt` | timestamp |
| `createdBy` | user |

Call result (child of enquiry, one per party per call):

| Field | Type | Notes |
|---|---|---|
| `id` | id | |
| `enquiryId` | id | |
| `party` | enum | buyer / seller |
| `status` | enum | Connected / Not Connected / Call Back |
| `notes` | string | Optional |
| `createdAt` | timestamp | |
| `createdBy` | user | |

Sale detail (captured when a property is marked sold):

| Field | Type | Notes |
|---|---|---|
| `enquiryId` | id | Or hung off the property record instead — see open questions |
| `soldPrice` | number \| null | In lakhs, optional |
| `platform` | string \| null | Selling platform, optional |
| `notes` | string | Optional |
| `createdAt` | timestamp | |
| `createdBy` | user | |

## 7. Current implementation state

Built, running on mock data:

- Stat cards — Overall/Today split on all four cards, counts computed from the data, click-to-filter, active-tile highlight
- Filter bar, all filters controlled from page state
- Filters applied for real: rows and Overall counts both recompute; Today counts stay unfiltered
- Table with sticky header, sticky Actions column, inner-scroll shell, pagination
- Both editable dropdowns (enquiry status, current property status) with colour coding, per-row selection
- Old read-only Property Status column kept alongside the new editable one
- Sold modal with price / platform / notes, cancel-safe (status only changes on Update)
- Notes drawer with per-contact threads, add-note, note list, empty state
- Call drawer with per-contact call results — connection status, notes, save / clear all
- Shared buyer/seller contact picker (copy number, selection, per-contact badge) used by both drawers
- Property name truncation with hover tooltip

Not built:

- Backend / API. Everything reads from `src/data/mockEnquiries.js`.
- `Add Feedback` button has no action wired.
- `Add Enquiry` button has no form wired.
- Search box is not wired.
- Pagination page numbers are static (`1..7, …, 64`); no data paging.
- Nothing persists — status changes, notes, call results, and sale details all live in component state and are lost on refresh.
- Selling platform list is a placeholder set, not the real one.
- Marking a call `Connected` does not flip the `Contacted` column; marking a property `Sold` does not touch the enquiry's own Status.

## 8. Open questions

1. Is `Contacted` derived from call results (a `Connected` call marks it), or is it a separate action?
2. What is `Add Feedback` — a modal form, a different drawer, or a status change? What fields?
3. Property Status is edited here, but it belongs to the property, not the enquiry — does editing it write back to the property record, and does that change show on the Properties page?
4. Same for sale details: stored against the enquiry, or against the property?
5. Does Resale / Rental change which columns are shown, or just filter rows?
6. Do notes need edit / delete, or append-only?
7. Server-side pagination and filtering, or client-side?
8. Permissions — can every user change any enquiry's status, or only the owning KAM?
9. The two property-status columns overlap — is `Property Status` derived from `Current Property Status` (anything but Available), a point-in-time snapshot taken when the enquiry was worked, or genuinely independent?
10. What is the real selling-platform list?

## 9. Files

| File | Role |
|---|---|
| `src/components/Enquiries/EnquiriesPage.jsx` | Page shell, owns filter + active-card state |
| `src/components/Enquiries/EnquiriesStatsCards.jsx` | Clickable KPI cards |
| `src/components/Enquiries/EnquiriesFilters.jsx` | Filter bar (controlled) |
| `src/components/Enquiries/EnquiriesTable.jsx` | Table, pagination, per-row state, drawer/modal wiring |
| `src/components/Enquiries/StatusDropdown.jsx` | Colour-coded status picker, reused by both status columns |
| `src/components/Enquiries/NotesPanel.jsx` | Notes side drawer, one thread per contact |
| `src/components/Enquiries/CallPanel.jsx` | Call drawer, one call result per contact |
| `src/components/Enquiries/PartyNumberPicker.jsx` | Shared buyer/seller picker with copy + badge |
| `src/components/Enquiries/SoldStatusModal.jsx` | Sold modal — price, platform, notes |
| `src/components/Enquiries/enquiryStats.js` | Filter predicates and stat-card counts |
| `src/components/Enquiries/enquiryConstants.js` | Shared constants — options, colour maps, platforms |
| `src/data/mockEnquiries.js` | Mock stats + rows |
