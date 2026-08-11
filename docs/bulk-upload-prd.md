# PRD — Bulk Upload (Properties)

**Status:** UI built (client-side parsing + validation, mock persistence), backend pending
**Owner:** _TBD_
**Last updated:** 2026-08-11

---

## 1. Summary

Bulk Upload is the intake screen for property inventory that arrives as a spreadsheet. Channel partners and internal KAMs send property lists as CSV/TSV exports; today those rows are copied into the CRM by hand.

The screen takes a file, maps its columns to CRM fields, validates every row against the property schema, uploads the clean rows, and then lets the user attach images to each property that was just created — all in one pass, without leaving the page.

## 2. Problem

- Inventory sheets are typed into the CRM row by row. Slow, and errors are invisible until someone spots a wrong price weeks later.
- Every partner's sheet has different column names and different orderings.
- Source data is messy in predictable ways: `2 BHK` and `3b 2t` in a bedrooms column, `26/Dec/2025` dates, prices as `1.76 Cr` or `17600000`, blank micromarkets, garbage in free-text columns.
- Photos are handled in a separate step later, so freshly added inventory sits image-less and unsellable.
- Nobody finds out which rows were rejected, or why.

## 3. Goals

1. Accept the sheets the team already has — comma or tab separated, any column order, extra columns present.
2. Auto-map columns, and let the user correct any mapping before anything is written.
3. Show every problem row-by-row before upload, separating *blocking* errors from *worth-a-look* warnings.
4. Never write a bad row: upload is locked until zero errors remain.
5. Attach images per property immediately after upload, in the same flow.
6. Give the user a fixable artifact back — an error report CSV of the rejected rows.

### Non-goals

- Bulk upload of any entity other than properties (leads, agents, requirements).
- Editing cell values inside the CRM. Fixes happen in the source sheet and get re-uploaded.
- Updating existing properties (upsert). This is create-only.
- Excel (`.xlsx`) parsing — CSV/TSV export only.
- Background / resumable uploads for very large files.
- Image cropping, ordering, or a primary-image picker.
- Self-serve upload by channel partners or agents. Internal, KAM Moderator only (§4).

## 4. Users and access

**This page is restricted to the KAM Moderator role. No other role may reach it.**

| Role | Access |
|---|---|
| KAM Moderator | Full access — the only role that can open Bulk Upload and run an upload |
| KAM / ops executive | No access |
| Ops lead | No access |
| Everyone else | No access |

Bulk upload writes many property records in one action, with no per-row review by anyone downstream, so the capability is deliberately held by a single role rather than shared with the KAMs who work the inventory day to day.

Enforcement expectations:

| Layer | Behavior |
|---|---|
| Sidebar | The `Bulk Upload` nav item is hidden for every role except KAM Moderator |
| Route | `/bulk-upload` rejects direct navigation by an unauthorised role — redirect to Home, not a blank page |
| API | The upload endpoint re-checks the role server-side. The UI gate is convenience, not security |

| User | Needs |
|---|---|
| KAM Moderator | Push a partner's sheet into the CRM in one go, see what failed, fix and retry, and stand behind the data that lands |

## 5. Flow

Three steps, tracked by a step indicator that stays visible throughout.

```
[1 Upload File] → [2 Map & Validate] → [3 Result]
```

Forward movement is gated: step 2 is reached only after a file parses, step 3 only after validation is clean.

### 5.1 Step 1 — Upload File

Two-column layout.

**Left — dropzone**

- Drag-and-drop or click to browse. `.csv` only, 5 MB cap.
- Rejects with an inline banner: wrong file type, oversized file, empty file, header-only file, headerless first row.
- `Download CSV template` — emits all 44 supported columns as headers plus one sample row.

**Right — reference panel**

- Count of supported columns.
- `Always required` — the fields every row needs, regardless of listing type.
- `Required depending on the row` — each conditionally mandatory field with its condition in plain English ("rental listings", "if possession is under construction").
- `Other groups` — each field group with its field count.
- Note that Property ID and Status are set by the CRM, and that every property needs at least one photo, added in step 3.

On success the file is parsed, columns are auto-mapped, and the wizard advances to step 2.

### 5.2 Step 2 — Map & Validate

Everything on this step recomputes live whenever a mapping changes.

**Summary cards** — Rows in file / Ready to upload / With warnings / Blocked by errors.

**Blocking notices** (amber, above the mapping table):

| Notice | Trigger |
|---|---|
| Required field(s) not mapped | A required field has no column pointing at it |
| Mapped to more than one column | Two columns claim the same CRM field |
| CP IDs not found in Agents | CP IDs in the file match no agent record — informational, rows still upload |

**Column mapping table** — one row per column in the file:

| Column | Notes |
|---|---|
| CSV column | Header as it appears in the file |
| First value | First data row's value, for orientation |
| CRM field | Dropdown, grouped by field group; required fields marked `*`; `— Ignore this column —` first |
| Status | `Mapped` or `Ignored` |

Behavior:

- Auto-mapping matches on the field key, the field label, or a per-field alias list, all normalised (case, spaces, punctuation). First unclaimed match wins, so a field is never auto-mapped twice.
- Unrecognised columns land on `Ignored` and are skipped.
- A search box filters the column list — needed because real sheets run 70+ columns.
- The table scrolls inside a fixed shell with a sticky header.
- A column pointing at a field that no longer exists in the schema reads as `Ignored` and is excluded from the mapped count.

**Validation issues** — two panels, errors first:

- *Blocked rows* — per row, each failing field with its value and message, plus `Download error report`.
- *Rows with warnings* — same shape, stated as "will still upload".
- Both collapse to 15 rows with a show-more toggle. When there are no errors, a green line states how many rows are ready.

**Preview** — first 10 uploadable rows, normalised, over the key columns, each tagged `Clean` or `N warnings`.

**Footer** — `Choose another file` on the left; on the right, the reason the upload is blocked (if any) and `Upload N properties`.

### 5.3 Step 3 — Result

**Summary bar** — count uploaded, source filename, how many properties have images and the total image count. When any property still lacks a photo, an amber "N still need a photo" line appears and `View properties` is disabled — photos are mandatory (§6.2), so the batch is not finished until every property has one. `Upload another file` stays available.

**Uploaded properties table** — one row per created property over the key columns, plus:

| Column | Notes |
|---|---|
| Status | Always `Available` — set by the CRM, badge-styled |
| Images | Up to 3 thumbnails, overlapped, with a count — or an amber `Photo required` when empty |
| Actions | `Add Images` / `Manage` |

**Images modal** — opens per property:

- Header — property name, Property ID, `n of 10 added`.
- Dropzone — drag-and-drop or browse, multiple files, `image/*`, 5 MB each, 10 per property.
- Rejections and over-limit adds are reported inline; whatever fits is still added.
- Thumbnail grid with per-image remove on hover.
- `Done` closes.

Generated Property IDs are marked `new` in the table so it is obvious which IDs the CRM minted.

## 6. Validation rules

### 6.1 Severity model

| Severity | Meaning | Effect |
|---|---|---|
| Error | Value cannot be stored | Row is blocked; the whole upload is locked |
| Warning | Value is odd or a recommended field is empty | Row still uploads, normalised |

Row status is `error` if it holds any error, `warning` if it holds only warnings, else `ok`.

### 6.2 Mandatory fields

Requirements are **conditional on listing type**, asset type, and possession. A field is mandatory for a row only if that row's own values say so.

**Always mandatory, both listing types**

| Field | Notes |
|---|---|
| `listingType` | Decides which branch of the rules applies |
| `propertyType` | |
| `assetType` | |
| `cpId` | Attribution — which channel partner the inventory came from |
| `propertyName` | "Project Name" in the sheet |
| `sbua` | |
| `facing` | |
| `noOfBedrooms` | |
| `noOfBathrooms` | |
| `floorNumber` | Accepts a number, `Ground floor`, or `Top floor` |
| `possession` | Allowed values differ per listing type — see below |
| Photos | At least one image per property, attached in step 3 |

**Mandatory for resale only**

| Field | Condition |
|---|---|
| `totalAskPrice` | Always, for resale |
| `pricePerSqft` | Always, for resale |
| `handOverDate` | When `possession = under construction` |

**Mandatory for rental only**

| Field | Condition |
|---|---|
| `furnishing` | Always, for rental |
| `ageOfBuilding` | Always, for rental |
| `rent` | Always, for rental |
| `deposit` | Always, for rental |
| `commissionType` | Always, for rental — `side by side` or `commission sharing` |
| `availableFrom` | When `possession = available by` |

**Mandatory by asset type**

| Field | Condition |
|---|---|
| `apartmentType` | Unless `assetType` is `plot` or `land` — `simplex`, `duplex`, `triplex`, `penthouse` |
| `plotArea` | When `assetType` is `plot` or `land` |
| `structure` | When `assetType` is `villa`, `villament`, or `row house` |

**Possession by listing type**

| Listing type | Allowed possession |
|---|---|
| Resale | `ready to move`, `under construction` |
| Rental | `ready to move`, `available by` |

A possession value outside its listing type's set is an **error**, not a warning.

Error messages name the condition, so a rejected row explains itself: *"Handover Date — Required for this row (if possession is under construction)"*.

If a conditionally mandatory field has **no column mapped at all**, step 2 raises a single notice — "Rent is mandatory for 12 rows (rental listings) but no column is mapped to it" — instead of only repeating the same error on every row.

### 6.2.1 Other field-level rules

| Rule class | Behavior |
|---|---|
| Recommended | Blank → warning. Fields: `agentName`, `agentPhoneNumber`, `micromarket` |
| Strict enum | Value outside the set → error. Used for `listingType`, `propertyType`, `assetType`, `apartmentType`, `possession`, `commissionType` |
| Soft enum | Value outside the set → warning, value kept as-is. Used for `communityType`, `facing`, `zone`, `furnishing` |
| Unique | Repeat within the same file → error on the later row, naming the first row. Field: `propertyId` |
| Free text | Never fails — messy source columns such as `structure` and `extraDetails` pass through |

### 6.3 Value parsing

| Type | Accepts | Stored as |
|---|---|---|
| Price | `17600000`, `1.76 Cr`, `85 L`, `₹1,76,00,000` | `₹1.76 Cr` / `₹85.00 L` |
| Number | Digits with optional `sq ft`, commas, `₹`, `%`; `N/A` and friends | Plain number or `N/A` |
| Integer | Up to 4 digits, or `N/A` | As given |
| Bedrooms | `3`, `3 BHK`, `3b 2t`, `3B 3T` | Leading count, e.g. `3` |
| Floor | `0`–`999`, `Ground floor` / `Ground` / `G` / `GF`, `Top floor` / `Top` | Number, `Ground floor`, or `Top floor` |
| Boolean | `TRUE/FALSE`, `yes/no`, `y/n`, `1/0` | `TRUE` / `FALSE` |
| Date | `26/Dec/2025`, `26/12/2025`, `2025-12-26`, ISO timestamps | As given |
| Phone | 10-digit Indian mobile, with or without `+91` / `0`, spaces, dashes | Bare 10 digits |
| Coordinates | `lat,lng` within valid ranges | `lat,lng` trimmed |
| URL | `http://` or `https://` | Trimmed |

### 6.4 Cross-field rules

| Rule | Condition | Severity |
|---|---|---|
| Not a valid possession for this listing type | `possession` outside the set allowed for the row's `listingType` | Error |
| Ready To Move contradicts Possession | `readyToMove` disagrees with `possession = ready to move` | Warning |

Everything the old draft carried as a "normally has a price / rent / handover date" warning is now a hard requirement in §6.2.

### 6.5 CRM-managed fields

Not mappable, never read from the sheet:

| Field | Set to |
|---|---|
| `status` | `Available` on upload |
| `propertyId` | Kept if the sheet supplies one; otherwise generated as `PB<next>` from the highest existing ID |

## 7. Column schema (44 fields)

| Group | Fields |
|---|---|
| Identity & Listing | `propertyId`*, `listingType`, `communityType`, `propertyType`, `assetType`, `apartmentType` |
| Agent | `cpId`, `agentName`, `agentPhoneNumber` |
| Location | `propertyName`, `micromarket`, `area`, `coordinates`, `zone`, `address`, `mapLocation` |
| Configuration | `sbua`, `facing`, `noOfBedrooms`, `noOfBalcony`, `noOfBathrooms`, `plotArea`, `structure`, `floorNumber`, `referredFloorNumber`, `totalFloors`, `noOfSeats`, `furnishing`, `possession`, `readyToMove`, `handOverDate`, `availableFrom`, `ageOfBuilding`, `unitNo`, `uds`, `parking` |
| Pricing | `totalAskPrice`, `pricePerSqft`, `commissionType`, `maintenance`, `maintenanceAmount`, `extraDetails` |
| Rental Terms | `rent`, `deposit` |

\* `propertyId` is mappable but optional, and unique-checked when supplied.

`availableFrom` and `ageOfBuilding` are new fields, not present in the current sheet — they exist because the rental spec requires them.

Key columns (shown in the preview and post-upload tables): `propertyId`, `propertyName`, `assetType`, `noOfBedrooms`, `sbua`, `totalAskPrice`, `micromarket`, `agentName`.

### 7.1 Deliberately excluded

Columns present in the source sheet but intentionally not part of the upload — they land as `Ignored`:

| Excluded | Reason |
|---|---|
| `kamId`, `kamName`, `kamStatus` | KAM comes from the agent behind the CP ID, not the sheet |
| `status` | Set by the CRM on upload |
| `dataStatus`, `stage` | Internal pipeline state |
| `soldPrice`, `selleingPlatform` | Sale outcome, captured in the Enquiries flow |
| `timestamp1`, `timestamp2`, `oldTotalAskPrice`, `newTotalAskPrice`, `oldAskpricePerSqft`, `newAskpricePerSqft` | Price-change history, system-generated |
| `dateOfInventoryAdded`, `dateOfLastChecked`, `lastModified` | CRM timestamps |
| `photo`, `video`, `document` | Photos are mandatory but attached as files in step 3, not as sheet links |
| `amenities`, `suitableFor` | Not used yet |
| Rental extras: `rentalIncome`, `currentDeposit`, `startDate`, `endDate`, `preferredTenants`, `petsAllowed`, `nonVegAllowed` | Not used yet |
| Compliance: `cornerUnit`, `exclusive`, `ocReceived`, `landKhata`, `buildingKhata`, `eKhata`, `biappaApproved`, `bdaApproved` | Not used yet |

## 8. Data model (draft)

Parsed table (client-only):

| Field | Type | Notes |
|---|---|---|
| `delimiter` | string | `Comma` / `Tab` / `Semicolon`, detected from the header line |
| `headers` | string[] | Trimmed |
| `rows` | string[][] | Aligned to `headers`, short lines padded |

Mapping (client-only): `{ [columnIndex]: fieldKey \| '__ignore__' }`.

Validated row (client-only):

| Field | Type | Notes |
|---|---|---|
| `id` | string | `row-<index>`, stable key |
| `rowNumber` | number | 1-based, header-adjusted — matches the spreadsheet |
| `cells` | string[] | Raw source cells, used for the error report |
| `values` | record | Normalised values, keyed by field |
| `issues` | issue[] | `{ field, value, message, severity }` |
| `status` | enum | `ok` / `warning` / `error` |

Uploaded property (what the API will receive):

| Field | Type | Notes |
|---|---|---|
| all 42 schema fields | — | Normalised values |
| `propertyId` | string | Supplied or generated |
| `status` | enum | `Available` |
| `images` | file[] | Attached in step 3 |

Image (client-only until an upload API exists):

| Field | Type |
|---|---|
| `id` | string (uuid) |
| `name` | string |
| `size` | number |
| `url` | object URL |

## 9. Current implementation state

Built and working on the client:

- CSV/TSV parsing — quoted fields, escaped quotes, CRLF, BOM strip, blank-row drop, delimiter auto-detection
- Template download; error-report download of rejected rows with a trailing `Errors` column
- Auto-mapping by key / label / alias, with per-column override, grouped dropdown, and column search
- Full validation engine: unconditional and conditional requirements, recommended fields, strict/soft enums, per-type parsers, in-file duplicate detection, cross-field rules
- Conditional requirements evaluated per row after the whole row is parsed, so listing type / asset type / possession decide what is mandatory; error messages quote the condition
- Notice when a conditionally mandatory field has no column mapped at all, with the affected row count
- Floor accepts `Ground floor` / `Top floor` / a number
- Photos enforced: `View properties` is disabled and rows are flagged until every property has at least one image
- Live recompute of counts, issues, and preview on every mapping change
- Upload locked until zero errors and all required fields mapped
- Property ID generation from the highest existing mock ID; status forced to `Available`
- Post-upload table with per-property image modal — drag-and-drop, thumbnails, remove, 10-image cap, blob URLs revoked on remove and unmount
- Unknown CP IDs surfaced once per file rather than per row

Not built:

- Backend / API. Nothing persists — uploaded rows and images live in component state and vanish on refresh or navigation.
- Uploaded properties do not appear on the Properties page; `View properties` navigates to the existing mock list.
- The upload step is a simulated 700 ms delay, not a request. No partial-failure handling, no retry.
- Image files are never transmitted; only local object URLs exist.
- No upsert / duplicate detection against properties already in the CRM — uniqueness is checked within the file only.
- **Role gating is not implemented.** The prototype has no auth or role context, so the sidebar item and the `/bulk-upload` route are open to anyone running the app. The KAM Moderator restriction in §4 is a requirement, not current behavior.
- Agent lookup runs against `src/data/mockAgents.js`, so real CP IDs report as not found.
- No audit trail of who uploaded what.

## 10. Open questions

1. Does the upload API take the whole batch atomically, or per-row with partial success? The UI currently assumes all-or-nothing.
2. Duplicate detection against existing inventory — match on `propertyId`, or on a composite (project + unit + CP)? Reject, skip, or update?
3. Should a sheet-supplied `propertyId` be honoured at all, or always regenerated?
4. Must a CP ID exist in Agents before its rows can upload? Today it is a warning, not an error.
5. One photo per property is the current minimum. Is that the real bar, or does it differ by asset type (a villa needing more than an apartment)?
6. Who owns image storage — direct-to-bucket upload from the browser, or via the API?
7. Should partially valid batches be uploadable ("upload the 40 clean rows, skip the 3 bad ones") instead of blocking the whole file?
8. Row cap per file, and does anything above it need a background job?
9. Can a KAM Moderator upload for any CP, or only for CPs within their own team's book?
10. Are the soft enums (`communityType`, `furnishing`, `zone`, `facing`) the real option sets?
11. Should mapping choices be remembered per partner, so a recurring sheet maps itself next time?
12. Where does the KAM Moderator role come from — an existing user record field, or a new permission that needs adding? Is more than one moderator expected per team?
13. Should each upload be stamped with the moderator who ran it, and is that trail visible on the property record?
14. `apartmentType` is treated as mandatory for everything except `plot` and `land` — is that the right carve-out, or should villas and commercial assets also be exempt?
15. `ageOfBuilding` is read as a number of years. Is that the unit, or is it a year of construction?
16. Are `side by side` and `commission sharing` the complete commission-type list?
17. Rental possession `available by` and the separate `availableFrom` date are two fields saying related things — should `availableFrom` be required for all rentals, not only when possession is `available by`?
18. Current sheets carry both `possession` and `readyToMove`. Should `readyToMove` be dropped in favour of `possession`, since it is now derivable?

## 11. Files

| File | Role |
|---|---|
| `src/components/BulkUpload/BulkUploadPage.jsx` | Wizard shell — step, file, mapping, images, upload state |
| `src/components/BulkUpload/StepIndicator.jsx` | Three-step progress header |
| `src/components/BulkUpload/UploadStep.jsx` | Dropzone, file guards, template download, column reference |
| `src/components/BulkUpload/MappingStep.jsx` | Summary cards, notices, mapping table, column search |
| `src/components/BulkUpload/ValidationIssues.jsx` | Error and warning panels, error-report download |
| `src/components/BulkUpload/PreviewTable.jsx` | Normalised preview of uploadable rows |
| `src/components/BulkUpload/ResultStep.jsx` | Post-upload summary and actions |
| `src/components/BulkUpload/UploadedPropertiesTable.jsx` | Created properties with image cell |
| `src/components/BulkUpload/PropertyImagesModal.jsx` | Per-property image picker |
| `src/components/BulkUpload/propertySchema.js` | The 42-field schema, groups, aliases, cross-field rules, auto-mapping, template |
| `src/components/BulkUpload/fieldTypes.js` | Cell types and parsers — price, number, date, boolean, phone, coordinates, bedrooms |
| `src/components/BulkUpload/validateRows.js` | Validation engine, mapping checks, summary, error report |
| `src/components/BulkUpload/buildProperties.js` | Validated rows → property records; ID generation, initial status |
| `src/components/BulkUpload/agentLookup.js` | CP ID → agent lookup, unknown-CP-ID collection |
| `src/utils/csv.js` | Delimited-text parse/serialise, delimiter detection, file read, download |
