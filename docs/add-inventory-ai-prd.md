# PRD — Add Inventory (single property) + Add with AI

**Status:** UI built (client-side form, mock AI extraction, no persistence), backend pending
**Owner:** _TBD_
**Last updated:** 2026-09-21

---

## 1. Summary

Add Inventory is the screen for putting one property into the CRM. It replaces the hand-typed row in a sheet and sits beside Bulk Upload, which covers the many-properties-at-once case.

The screen has two ways in, ending in the same form:

1. **Add Inventory** — the blank form. Five numbered sections, agent lookup at the top, live summary rail on the right.
2. **Add with AI** — a paste box. The user drops in the broker's WhatsApp or email message, the text is parsed into the property schema, and the form opens pre-filled with every field the message supported. Each auto-filled field is marked with where it came from and how confident the parse was. Nothing is submitted until the user reviews it.

The AI path is an accelerator on top of the form, never a replacement for it. Every field it fills stays editable, and the same validation gates the submit either way.

## 2. Problem

- Inventory arrives as free text: a WhatsApp forward, an email, a broker's voice-note transcript. Someone reads it and retypes ~20 fields into a form.
- Retyping is where the errors enter — a dropped zero in the price, the wrong facing, the floor and total floors swapped.
- The form is long (5 sections, 40+ fields). Typing it from scratch discourages KAMs from logging inventory the same day they receive it, so the CRM lags the market.
- Bulk Upload only helps when the source is already a spreadsheet. Most single listings never arrive as one.
- Agent details get keyed in by hand even though the agent already exists in the CRM and the message carries their phone number.

## 3. Goals

1. One screen for adding a single property, reachable from the places inventory is worked (Properties, and later QC and Agent Details).
2. Paste-to-fill: turn an unstructured listing message into a filled form in one action.
3. Make AI provenance obvious — the user must be able to tell at a glance what they typed, what was extracted, and what the parse was unsure about.
4. Never auto-submit. The AI pass fills, the human confirms.
5. Reuse the property schema, validators and parsers that Bulk Upload already uses, so a property created here and a property created from a sheet are identical records.
6. Resolve the agent from a phone number rather than making the user type CP ID and name.

### Non-goals

- Multiple listings in one paste. One message, one property. Several properties at once is Bulk Upload's job.
- Editing an existing property. This flow is create-only.
- A real model call. The current extractor is a deterministic local parser (§7.5); wiring an LLM is a separate, backend-owned change.
- Image analysis — extracting details from a floor plan or brochure image.
- Duplicate detection against existing inventory.
- Draft autosave / resume. Closing the page loses the form.
- Voice note transcription.

## 4. Users and access

| Role | Access |
|---|---|
| KAM / ops executive | Full access — the primary user |
| KAM Moderator | Full access |
| Ops lead | Full access |
| Everyone else | No access |

Unlike Bulk Upload, this flow writes one record at a time with the user reading every field before submit, so it does not need to be held to a single role.

Enforcement expectations:

| Layer | Behavior |
|---|---|
| Entry buttons | `Add Inventory` and `Add with AI` hidden for roles without access |
| Route | `/properties/new` rejects direct navigation by an unauthorised role — redirect to Properties |
| API | Create-property endpoint authorises independently of the UI |

## 5. Entry points

| Location | Control | Result |
|---|---|---|
| Properties page header | `Add Inventory` (dark, `+`) | `/properties/new` — blank form |
| Properties page header | `Add with AI` (violet, sparkle) | `/properties/new?mode=ai` — form with the paste modal already open |
| Add New Property header | `Add with AI` / `Paste another listing` | Opens the paste modal over the current form |

`?mode=ai` only decides whether the modal opens on load. The two entry points lead to the same page and the same state.

Not yet wired: the `Add Inventory` buttons on QC Dashboard and Agent Details. Both should point at the same route; the Agent Details one should pre-fill the agent (§7.4).

## 6. Flow

### 6.1 Manual path

1. User lands on `/properties/new`. The form opens on the common case: **Sell · Residential · Apartment**.
2. Optional: agent lookup by phone at the top (§7.4).
3. User fills the five sections. Conditional fields appear as they become relevant (§8.3).
4. `Submit Property`. If anything required is missing or malformed, errors are revealed in place and the submit is refused with a count in the footer. Otherwise a success confirmation appears.

### 6.2 AI path

1. User clicks `Add with AI`. Modal opens with an empty textarea, a `Use a sample` shortcut and a character count.
2. User pastes the listing message. `Fill form with AI` enables once the text passes 20 characters.
3. On click: the button shows a spinner, the textarea locks, and a status line cycles — *Reading the message… → Matching property fields… → Checking agent records…*
4. The extractor returns after ~1.4 s (simulated latency). The modal closes, the form is filled, and the results banner appears above section 1.
5. User reviews. Every extracted field carries a badge; low-confidence ones are also listed as chips in the banner. Editing a field flips its badge to `Edited`.
6. `Submit Property` — same gate as the manual path.
7. `Paste another listing` re-opens the modal at any point. A warning states that found fields will overwrite what is already in the form.

### 6.3 Results banner

Appears after a successful extraction, dismissible, and shows three counts:

| Count | Meaning |
|---|---|
| **fields filled** | How many fields the extractor set |
| **need a check** | Of those, how many are low confidence |
| **still required** | Mandatory fields still empty or invalid — the work left to do |

Below the counts, every low-confidence field is listed as a named chip so the user knows where to look without scrolling the whole form.

## 7. Add with AI — behaviour

### 7.1 Input

- Free text. No format expected: line breaks, emoji, bullet characters, mixed Hindi/English transliteration all pass through.
- Minimum 20 characters before extraction is allowed.
- Non-breaking and narrow spaces are normalised before parsing.
- Nothing leaves the browser in the current implementation.

### 7.2 Output contract

The extractor returns, per field: a **value** already normalised into the schema's vocabulary, and a **confidence** of `high`, `medium` or `low`. Fields the message says nothing about are not returned at all — they are left untouched rather than blanked.

### 7.3 Confidence model

| Level | Meaning | UI |
|---|---|---|
| `high` | An explicit, unambiguous statement — "1817 sqft", "west facing", "ready to move" | Violet ring + `AI filled` |
| `medium` | Read from a labelled-but-loose pattern, or a synonym mapping ("flat" → apartment) | Violet ring + `AI filled · check` |
| `low` | Inferred rather than stated — e.g. residential assumed because nothing commercial appeared, or the project name guessed from the first line | Amber ring + `AI guess · verify`, and a chip in the banner |

Rationale: a wrong high-confidence value is worse than a missing one, so anything inferred is visibly demoted rather than silently accepted.

### 7.4 Agent resolution

Two routes, same result:

- **Find Agent bar** — user types a 10-digit phone, hits Search. On a match, CP ID, agent name and phone fill and a confirmation line appears under the input. On a miss, an inline "No agent with that number" message.
- **AI pass** — any phone number or CP-ID-shaped token in the message is looked up against the agent records. A record match overrides whatever name the message claimed, and all three agent fields are marked `high`.

The precedence is deliberate: the CRM's own record beats the text, because broker messages routinely carry a different name from the registered one.

### 7.5 What the extractor reads

Deterministic rules, one per field, all reading the same raw text. Grouped by what they key off:

| Group | Fields | Signal |
|---|---|---|
| Listing intent | listing type, property type | Rent/lease/deposit vocabulary vs sale/resale/asking vocabulary; commercial vocabulary (office, retail, warehouse, seats) |
| Classification | asset type, apartment type, community type | Direct mention, plus a synonym map (flat → apartment, bungalow → villa, godown → warehouse) |
| Agent | CP ID, agent name, phone | ID-shaped token, `Agent:`-style label, 10-digit Indian mobile with optional +91 |
| Location | project name, micromarket, address, map link | Matched against known projects and micromarkets first, then a labelled pattern, then the first line as a low-confidence guess |
| Configuration | SBUA, plot area, structure, bedrooms, bathrooms, balconies, floor, total floors, facing, furnishing, parking, unit no., age of building | Number-plus-unit patterns; `Ground floor` / `Top floor` handled as named positions |
| Possession | possession, handover date, available-from | RTM / under construction / available-from phrasing, with dates in `26/Dec/2025`, `26/12/2025` or ISO form |
| Money | ask price, price per sqft, rent, deposit, maintenance amount | Amounts in plain digits or Indian shorthand (`3.35 Cr`, `85 L`, `45 k`), normalised through the shared price parser |

Known limits, accepted for now: one listing per paste; no relative dates ("possession next Diwali"); no area-unit conversion (sq m, cents, guntas); English-only vocabulary.

### 7.6 Provenance states

| State | Trigger | Marker |
|---|---|---|
| Untouched | Never filled | No badge |
| AI-filled | Set by extraction | Violet/amber badge + tinted input or pill |
| Edited | User changed an AI-filled value | Grey `Edited` badge, tint removed |
| Manual | User typed into an untouched field | No badge |

Editing an AI value is one-way: it never reverts to `AI filled`.

## 8. Form specification

Layout: 64px header (back arrow, title, AI button) → Find Agent band → two columns (form card, 340px summary rail) → sticky footer (`Cancel`, `Submit Property`).

### 8.1 Sections

| # | Section | Contents |
|---|---|---|
| 1 | Basic Details | You're looking to? (Sell / Rent) · What kind of property? (Residential / Commercial) · Select property type · Select community type (Gated / Independent) |
| 2 | Property Details | Project Name · Apartment Type · SBUA · Carpet Area · Door Facing · Floor No. + Total Floors · Furnishing · No. of Bedrooms · Extra Rooms · No. of Bathrooms · No. of Balconies · Balcony Facing · Possession (+ conditional date) |
| 3 | Pricing Details | Sale: Total Ask Price. Rent: Rent/month · Deposit · Maintenance · Maintenance Amount · Commission Type |
| 4 | More Details | UDS · Corner Unit / Exclusive / OC Received · Building Khata · Land Khata · E-Khata / BIAPPA / BDA approvals · Parking stepper · Amenities · Extra Details |
| 5 | Media Details | Property Images dropzone (cap 100) · document dropzone (PDFs and documents) |

### 8.2 Control vocabulary

| Control | Used for | Behaviour |
|---|---|---|
| Pill (single-select) | Enums up to ~10 options | Click selects, clicking the selected pill clears it |
| Pill (multi-select) | Extra Rooms, Amenities | `+` when unselected, tick when selected |
| Text input | Free text and measurements | Optional unit suffix (`Sqft`, `₹ / Sqft`) |
| Money input | All amounts | `₹` prefix, shorthand accepted, example hint below; the ask price also shows a live "in words" line and a unit selector |
| Checkbox | Boolean attributes | — |
| Stepper | Parking | 0–20 |
| Dropzone | Photos, documents | Click or drag; picked files list with per-file remove |

### 8.3 Conditional fields

| Field | Shown when |
|---|---|
| Apartment Type | Asset type is not plot or land |
| Handover Date | Possession is `under construction` |
| Available From | Possession is `available by` |
| Rent / Deposit / Maintenance / Maintenance Amount / Commission Type | Listing type is Rent |
| Total Ask Price | Listing type is Sell |
| Asset type options | Residential list vs commercial list, by property type |
| Possession options | Sale: Ready to Move, Under Construction. Rent: Ready to Move, Available By |

### 8.4 Summary rail

| Card | Contents |
|---|---|
| Agent & Property | Agent, phone, asset type, micromarket — the identity of what is being added |
| Media Summary | Existing / New / Total for photos, videos and documents |
| Status | Count of AI-filled fields, and either the outstanding-issue count or "Ready to submit". Hidden when neither applies |
| Tips | Three static hints, including how to use Add with AI |

Micromarket has no input on the form — it is derived from the project and shown here for confirmation only.

## 9. Validation

Same engine as Bulk Upload: shared schema, shared field types, shared conditional-requirement rules.

### 9.1 When errors appear

Errors stay hidden until the first `Submit Property`. After that they are live — fixing a field clears its message as you type. Rationale: a form that turns red before it has been filled in reads as broken.

### 9.2 Rules

| Rule | Behaviour |
|---|---|
| Required | Field must be non-empty. Conditional requirements resolve against the current values (e.g. handover date only when under construction) |
| Format | Non-empty values run the schema's parser — price, number, date, phone, coordinates, URL, floor, bedrooms |
| Pill fields | Format checks skipped; the option list already constrains the value. Requiredness still applies |
| Form-only requirement | Maintenance Amount is mandatory on rentals here, though the upload schema treats it as optional |
| Hidden fields | Price per sqft is not rendered on this form and can never block a submit |

### 9.3 Failure feedback

Three places at once: the field turns red with a message underneath, the footer shows `N fields need attention before submitting`, and the Status card in the rail repeats the count. A failed submit changes nothing else on the page.

## 10. Visual language

| Element | Treatment |
|---|---|
| Section number | Dark emerald circle, white numeral |
| Selected pill | Emerald border, emerald-50 fill |
| Submit | Green, bottom-right, sticky |
| Find Agent band | Blue-50 band, blue heading, indigo Search |
| AI affordances | Violet — the `Add with AI` button, badges, banner and filled-field tint |
| Low confidence | Amber — badge, input tint, banner chips |
| Errors | Red — asterisks, borders, messages |

Violet is reserved for AI provenance and used nowhere else, so "violet means the machine did this" holds across the screen.

## 11. Data model

The form produces one property record in the shared schema's shape. Fields on this form that the upload schema does not yet carry:

| Field | Type | Note |
|---|---|---|
| `carpetArea` | number (sq ft) | Alongside SBUA |
| `extraRooms` | string[] | Servant / Study / Pooja / Other |
| `balconyFacing` | enum | Inside / Outside |
| `cornerUnit`, `exclusive`, `ocReceived` | boolean | — |
| `buildingKhata`, `landKhata` | enum | A-Khata / B-Khata |
| `khataFlags` | string[] | E-Khata, BIAPPA approved, BDA approved |
| `amenities` | string[] | 19 options |
| `priceUnit` | enum | Whether the amount entered is a total or a per-sqft rate |

Media is currently held as file names only — no upload, no object URLs. The AI provenance map (`sources`, `confidence`) is UI state and is not intended for persistence unless §12 Q6 says otherwise.

## 12. Current implementation state

| Area | State |
|---|---|
| Route and entry points | Done — `/properties/new`, both Properties buttons wired |
| Form, all five sections | Done |
| Conditional fields | Done |
| Validation and submit gate | Done — client-side, shared with Bulk Upload |
| Find Agent lookup | Done — against mock agents |
| AI paste modal, loading state, banner, provenance badges | Done |
| Extraction | Done as a local deterministic parser. No model call |
| Media | Picker lists file names only — no upload, no previews |
| Persistence | None. Submit shows a confirmation and stops |
| Project-name autocomplete | Not built — plain text input today |
| QC Dashboard / Agent Details entry points | Not wired |

## 13. Open questions

1. Does the AI path call a hosted model, and if so through which service — the extraction happens in the browser today, and a model call needs a backend proxy so no key ships to the client.
2. If it becomes a model call: what is the latency budget before the modal needs a cancel, and what happens on timeout — fall back to the local parser, or fail closed?
3. Should the pasted source text be stored on the property record for audit, and for how long? It may contain the broker's personal contact details.
4. Should the AI be allowed to fill Total Ask Price at all, or should money always be typed by a human?
5. Multiple listings in one paste — worth supporting, or is that squarely Bulk Upload's job?
6. Is "this field came from AI" worth persisting to the record, so QC can prioritise machine-filled listings for review?
7. Does Project Name need an autocomplete against the projects master, and should selecting a known project auto-fill micromarket, zone and amenities?
8. Are the khata fields (Building, Land, E/BIAPPA/BDA) Bengaluru-only? What happens in another city?
9. Is `5+` an acceptable stored value for bedrooms and bathrooms, or must it resolve to an exact number?
10. Is `Studio` a bedroom count of 0, or a separate flag?
11. Should Carpet Area be validated against SBUA (carpet must be smaller)?
12. Maintenance is `Included` / `Not Included` on rentals — what is the sale-side equivalent, and should it appear there?
13. Image upload target — direct-to-bucket from the browser or via the API, and is one photo a hard minimum here as it is for Bulk Upload?
14. On submit, does the property land as `Available`, or in a QC pending state — and does that differ when the form was AI-filled?
15. Should a draft be kept if the user navigates away mid-form?
16. Who can add inventory on behalf of which CP — any agent, or only CPs in the user's own book?

## 14. Files

| File | Role |
|---|---|
| `src/components/AddInventory/AddInventoryPage.jsx` | Page shell — form state, validation, submit, modal and media state |
| `src/components/AddInventory/FindAgentBar.jsx` | Phone-first agent lookup band |
| `src/components/AddInventory/AiPasteModal.jsx` | Paste box, sample text, loading state, status ticker |
| `src/components/AddInventory/AiExtractionBanner.jsx` | Post-extraction counts and low-confidence chips |
| `src/components/AddInventory/SummarySidebar.jsx` | Agent & Property, Media Summary, Status, Tips |
| `src/components/AddInventory/FormSection.jsx` | Numbered section wrapper |
| `src/components/AddInventory/formModel.js` | Values/sources/confidence state, defaults, validation, requirement overrides |
| `src/components/AddInventory/formOptions.js` | Option lists, display labels, choice-constrained and form-only field keys |
| `src/components/AddInventory/aiExtract.js` | Extraction entry point — rules, project/micromarket matching, agent resolution, sample listing |
| `src/components/AddInventory/extractionRules.js` | One heuristic rule per field, with per-rule confidence |
| `src/components/AddInventory/priceWords.js` | Amount → Indian-notation words |
| `src/components/AddInventory/sections/BasicDetailsSection.jsx` | Section 1 |
| `src/components/AddInventory/sections/PropertyDetailsSection.jsx` | Section 2 |
| `src/components/AddInventory/sections/PricingSection.jsx` | Section 3, sale and rent variants |
| `src/components/AddInventory/sections/MoreDetailsSection.jsx` | Section 4 |
| `src/components/AddInventory/sections/MediaSection.jsx` | Section 5 |
| `src/components/AddInventory/fields/FieldShell.jsx` | Label, provenance badge, error line |
| `src/components/AddInventory/fields/ChoiceGroup.jsx` | Single-select pills |
| `src/components/AddInventory/fields/MultiChoiceGroup.jsx` | Multi-select pills |
| `src/components/AddInventory/fields/TextField.jsx` | Text input with optional suffix and search icon |
| `src/components/AddInventory/fields/PriceField.jsx` | Money input — ₹ prefix, unit selector, words line |
| `src/components/AddInventory/fields/CheckboxField.jsx` | Checkbox |
| `src/components/AddInventory/fields/CounterField.jsx` | Parking stepper |
| `src/components/AddInventory/fields/pillStyles.js` | Shared pill and input styling, including provenance tints |
| `src/components/BulkUpload/propertySchema.js` | Shared schema — reused, not duplicated |
| `src/components/BulkUpload/fieldTypes.js` | Shared parsers and validators |
