# Legal & Doc — Schema & Build Reference

Early draft, scaffolding stage — the schema and catalogue below are what we're building against
right now, not a finished spec. Treat this as the source of truth for `src/data/mockLegalDoc.js`
and the Legal & Doc pages; update it as the shape changes.

**This is the second schema generation** (storage key `acn_legal_doc_records_v9`) — it replaced an
earlier shape that had `request.stage`/`request.level`, a `lead`/`qualify`/`service` sub-object per
request, and a separate `statusLog` array. That's gone. The current shape was given wholesale and
adopted as-is: `legalAndLoan.status` is just `good`/`maybe`/`bad`, each request carries a single
flat `status` (the whole funnel in one enum), and `lead`/`qualify`/`service` are replaced by
`clients[]` — a request can have more than one point of contact, each with their own call log,
services and invoice.

`src/data/mockLegalDoc.js` persists to `localStorage` so edits survive a refresh — it seeds from
`buildSeedRecords()` on first load, then every mutating function (`updateRequestStatus`,
`addAgentNote`, `addClient`, `addServiceToClient`, `addClientConnection`, `addLeadRequest`,
`updateLegalDocRecord`) writes the whole array back. `resetLegalDocData()` wipes back to the seed
(wired to the small reset icon in the Leads page header).

## 1. What this is

A per-agent pipeline for tracking legal/loan service requests (e-khata, registration, home loans,
etc.) that agents raise for their clients. Each agent record carries a `legalAndLoan` object (the
data field name, kept as given — the feature itself is called "Legal & Doc"); inside it, a list of
`requests`, each of which can have one or more `clients` (points of contact) who each want their
own set of services. There is no real backend yet: `src/data/mockLegalDoc.js` is an in-memory seed
mirroring this shape.

Each agent record also carries `contact` (phone) and `kam` (the KAM it's assigned to — one of the
real roster in `KAM_OPTIONS`, matching `src/data/mockHome.js`'s `kamList`) at the top level,
alongside `agentId`/`agentName` — agent-level fields, not part of the `legalAndLoan` object itself.
`KAM_OPTIONS` doubles as the `userId` value set for `leadBy`/`qualifiedBy`/`salesPoc`/every `user`
field in this mock — there's no separate user system yet.

Pages:
- `/legal-doc/lead` — `LegalDocLeadsPage.jsx` — the built-out one. Styled after
  `EdgeProjectsPage.jsx` (stone palette, sticky table header, filter bar).
  - **Table**: search + Status / Agent Status / KAM / Source filters plus a Sort control (in that
    order — `FilterSelect`, single-choice: Newest/Oldest first, Recently contacted, Name A-Z),
    paginated (`PAGE_SIZE = 20`, Prev/Next at the bottom). Active filters show as clearable chips
    next to the Filters button (visible even with the panel collapsed, plus a "Clear all" once more
    than one is active). Columns, in order: CP ID, Name, Number (phone grouped 3-5-5 with a copy
    icon), KAM, Agent Status, Created, Status, Source. No Level column anymore — `level` isn't part
    of this schema. "Status" is the request's single `status` pill plus how long ago the most
    recent call across *any* of its clients happened (`lastConnectionFor()` flattens every client's
    `connections` and takes the latest) — one line, no separate "Last contact" column. "Agent
    Status" is `legalAndLoan.status` directly — it's already just Good/Maybe/Bad in this schema, no
    derivation needed. Nothing in the table is directly editable or clickable except **the row
    itself** — clicking anywhere opens the side panel; there's no per-row dropdown or popover.
  - **Side panel** (slide-over from the right, `w-2/5` of the viewport with a `min-w-[420px]`
    floor, click a row to open, click the backdrop or × to close). Header is just the × — agent
    identity isn't crammed into it. Content is a stack of bordered boxes top to bottom:
    - **Agent identity box**: agent name (large, bold) left, CP ID (small mono text) right, same
      line; contact (with copy) + KAM underneath.
    - **Agent status box**: `legalAndLoan.notes`, reverse chronological — each note can optionally
      tag a Good/Maybe/Bad status change (shown as a pill) or just be a plain comment (shown as
      "Note"), "_time_ ago by _person_" right-aligned, the text on its own full-width line
      underneath. Read-only here; changed via `addAgentNote()` elsewhere (not yet wired to a UI
      control on this page — see §6).
    - **Request box**: Status (colored pill, same `STATUS_STYLES`/labels as the Status box below) at
      the top of the grid, then Request ID, Source, Lead by, Qualified by, Sales POC.
    - **One box per client**: client + services only, nothing else. For a real client, name +
      phone, plus a small × (`removeClient`) top-right next to the invoice PI id (if raised) to drop
      that client entirely; for "agent (self)" the heading reads "AGENT POC" (leaving it blank read
      as broken, not intentional) and there's no × — it can carry zero services, but it can't be
      removed outright, since a request always needs at least one POC and this is the one it starts
      with (`removeClient` no-ops on an `agent` client server-side too, not just a hidden button).
      No separate POC-type badge pill — the heading already says which kind it is. Services are
      plain gray pills (not the colorful request-status
      palette — every new service defaults to `negotiation`, which made every pill the same
      sky-blue), each with its own small "−" to drop it (`removeServiceFromClient` — decrements
      `qty`, removes the pill outright once `qty` would hit 0); pills and the toggle circle use
      bigger padding (`px-3 py-1.5` pills, `w-6 h-6` circle) than the rest of the panel's pills so
      they read as the primary content of this box, plus a "+"/"×" toggle circle inline
      in the same row; clicking it expands the full `SERVICE_NAME_OPTIONS` list right there (not a
      floating dropdown, and alphabetical — not grouped) as small clickable tiles — click one to
      add it immediately, click an already-added one again to bump its `qty` (shown as "×2" etc. on
      the pill) rather than no-op. `qty` isn't in the schema as given; it's the one field added
      beyond it, because nothing else there lets a client want two of the same service. "Gruha
      Jyothi" was dropped from `SERVICE_NAME_OPTIONS` (and the catalogue) — not actually offered.
      Payment-received note if set. No call log inside this box — calling isn't something you do to
      a specific client/POC in this flow, it's managed on the agent side, so it lives once, below
      all the client boxes (see the shared call-log box further down), not duplicated per client.
      All text in this box is the same 13px as the rest of the panel except the pills/timestamps
      (11px), matching the Agent status box's sizing — service pills and picker tiles had drifted to
      12px, inconsistent with everything around them. A "+ Add another client / POC" button at the
      bottom of the client list calls
      `addClient` — just a name and a number,
      always `pocType: 'client'` (there's no reason to re-pick "agent (self)" when deliberately
      adding a new point of contact).
    - **Call log box** (right after the client list, before Status): one shared timeline for the
      whole request — `lastConnectionFor(request)` flattens every client's `connections` and takes
      the latest, same display shape as the Agent status box. The "+"/"×" toggle form adds a client
      picker (by name, or "Agent POC") on top of status/position/notes, since `addClientConnection`
      still needs to know which client's `connections` array to push onto even though the display
      doesn't split by client.
    - **Status box**: a full timeline of `request.statusLog` (reverse chronological, same per-entry
      shape as the Agent status box minus the "by _person_" — just pill top-left, "_time_ ago"
      top-right, reason underneath; dropping the user kept this box from feeling redundant with the
      Agent status box right above it). The composer (a "Reason..." text line, then a status picker
      with a dark "Save" button on the right) isn't inside this bordered box — it's pulled out into
      its own `sticky bottom-0` footer at the bottom of the panel, mirroring the `sticky top-0`
      header, so it's reachable without scrolling even as the timeline grows. The picker is a custom
      pill-styled `<select>` (`appearance-none`, colored via `STATUS_STYLES[statusSelectValue]`,
      with an overlaid chevron icon) instead of a plain bordered dropdown, so it visually matches the
      status pills everywhere else on this page rather than looking like a generic form control; it
      still lists every `REQUEST_STATUS_OPTIONS` value (not a constrained next-steps list — `rnr1`,
      `rnr2`, etc. are all pickable directly). Saving calls `updateRequestStatus` (which pushes the
      new status + reason onto `statusLog`); reaching `qualified` sets `qualifiedBy` if it isn't set
      yet. The panel then closes itself once the status moves past the lead stage, since the request
      just left this list — otherwise the picker resets to the new current status. `statusLog` isn't
      in the schema as given (`request.status` was a flat value there); `NEXT_STATUS_MAP` still
      exists in the data layer but nothing on this page uses it anymore.
  - **Add Lead** modal: Agent ID, Agent name, Contact, KAM, Service, Source — creates the agent
    record if the id doesn't exist yet, with one request (`status: 'new'`) and one client
    (`pocType: 'agent'`, i.e. no end-client identified yet).
- `/legal-doc/qualify`, `/legal-doc/service` — still `LegalDocListPage.jsx`, a plain read-only flat
  list (Agent, Request, Summary — status pill + every client's services, flattened) filtered by
  `stageForRequestStatus(req.status)`. Not yet built out to the Leads page's level.
  `/legal-doc` redirects to `/legal-doc/lead`. In the sidebar, "Legal & Doc" is a dropdown group
  ("Leads" / "Qualify" / "Service") instead of a single link.
- `/legal-doc/home` — `LegalDocHomePage.jsx` — intentionally blank for now, to be designed next.
  Sidebar label "Home", its own top-level sidebar item (not inside the Legal & Doc dropdown).
- `/legal-doc/agent/:id` — `LegalDocPage.jsx` — per-agent detail: notes (with status tags),
  requests, each request's clients (POC, call log, services, documents). Not linked from the
  sidebar (reached by clicking a row on a stage list page).

## 2. Schema

```
agent.legalAndLoan
├─ status    'good' | 'maybe' | 'bad'
├─ notes     [{ text, status: ''|good|maybe|bad, time, user }] — the agent's status history; a note
│               with a status changes legalAndLoan.status, a note with status: '' is just a comment
└─ requests  [...]                                              — see below
```

```
request (one per legalAndLoan.requests[])
├─ id           text, e.g. "R1"
├─ source       enum [app, marketing]
├─ status       enum — REQUEST_STATUS_OPTIONS (see §3) — the whole funnel in one flat value;
│                  status always equals the last statusLog entry's status
├─ statusLog    [{ status, notes, time, user }] — not in the schema as given (status was described
│                  as a flat value with no history); added so the Status box can show a timeline.
│                  `updateRequestStatus()` is the only place this and `status` both get written.
├─ leadBy       userId — who brought this lead in
├─ qualifiedBy  userId | null — who qualified it (set automatically on reaching `qualified` if
│                  not already set)
├─ salesPoc     userId | null
├─ createdAt    timestamptz
└─ clients      [...]                                            — see below, 1+ per request
```

```
client (one per request.clients[]) — a point of contact: either a real end-client, or the agent
themselves standing in until one is identified
├─ pocType          enum [client, agent]
├─ name             text — only if pocType = "client"
├─ phone            text — only if pocType = "client"
├─ connections      [{ status, position, notes, time, user }]   — this client's own call log; see
│                      §3 for `status`/`position` enums. This is where "new -> rnr -> connected"
│                      history lives now (the request's `status` field itself has none)
├─ invoice          { piId, total }
├─ paymentReceived  boolean
└─ services         [...]                                        — see below
```

```
service (one per client.services[])
├─ name              enum — SERVICE_NAME_OPTIONS (see §4)
├─ qty               number — not in the schema as given; added because nothing else there lets the
│                       same service be requested more than once. Adding a service already on the
│                       client bumps this instead of being a no-op.
├─ chargeableAmount  number | null
├─ documents         [{ name, received }]
└─ status            enum — SERVICE_STATUS_OPTIONS (see §3)
```

## 3. Enums

**`REQUEST_STATUS_OPTIONS`** (`request.status`) — the one standard stage list the whole request
moves through end to end. Convention: snake_case `value` (no underscore in `rnr1`-`rnr5`), Title
Case `label`.

| Value | Label |
|---|---|
| `new` | New |
| `rnr1`…`rnr5` | RNR 1…RNR 5 |
| `qualified` | Qualified |
| `negotiation` | Negotiation |
| `documents_collected` | Documents Collected |
| `invoice_sent` | Invoice Sent |
| `payment_received` | Payment Received |
| `service_forwarded` | Service Forwarded |
| `lost` | Lost |

`NEXT_STATUS_MAP` defines the valid next stop(s) from each status — the Leads panel only offers
these as "Mark as:" buttons. `lost` can reopen to `new`; `service_forwarded` is terminal.
`LEAD_STAGE_STATUSES` / `QUALIFY_STAGE_STATUSES` / `SERVICE_STAGE_STATUSES` group these for the
three list pages; `stageForRequestStatus()` maps a status to its group.

**`AGENT_STATUS_OPTIONS`** (`legalAndLoan.status`, and each note's optional `status`): `good`,
`maybe`, `bad`. That's the whole enum now — no six-value version to derive it from.

**`CONNECTION_STATUS_OPTIONS`** (`client.connections[].status`): `connected`, `rnr`,
`not_reachable`, `switched_off`, `call_back`. (Simpler than `REQUEST_STATUS_OPTIONS`'s rnr1-5 —
calls don't carry an attempt number, the request status does.)

**`POSITION_OPTIONS`** (`client.connections[].position`): `lead`, `qualify`, `service` — which
phase of the funnel that call happened in.

**`POC_TYPE_OPTIONS`** (`client.pocType`): `client`, `agent` (the agent is their own POC until a
real client is identified).

**`SERVICE_STATUS_OPTIONS`** (`service.status`): `negotiation`, `documents_collected`,
`invoice_sent`, `payment_received`, `service_forwarded`, `lost`. New services default to
`negotiation` — there's no earlier "just requested, not discussed" value in this schema.

## 4. Service names (`SERVICE_NAME_OPTIONS`, i.e. `service.name`)

The array itself is in alphabetical-by-label order (that's the order the Leads panel's service
picker shows them in) — grouped here by `group` only for readability. `graha_jyoti` (Gruha Jyothi)
was removed: not actually offered.

| Group | Values |
|---|---|
| Documentation | `e_khata`, `new_khata`, `khata_transfer`, `khata_correction`, `b_to_a_khata`, `e_to_e_khata`, `panchayat_khata`, `tax_name_change`, `rental_agreement`, `certified_copy` |
| Legal | `registration`, `sale_agreement`, `sale_deed`, `gift_deed`, `release_deed`, `will_deed`, `gpa`, `mou`, `assignment_agreement`, `partition_deed`, `due_diligence`, `ec`, `family_tree`, `modt_cancellation`, `bda`, `legal_consultation` |
| Utilities | `bescom` |
| Loans | `home_loan`, `balance_transfer`, `loan_against_property` |
| Other | `other` |

## 5. Catalogue (current price list, ₹)

Referral shown as listed; blank means none listed. Not yet linked to §4's enum by id — `CATALOGUE`
in `mockLegalDoc.js` holds it as a flat list matched by display name, same as before this schema
change; a shared service-id scheme between the two is still an open question.

| Service | Category | Agent price | Client price | Referral |
|---|---|---|---|---|
| E-Khata (BBMP) | Documentation | 4,500 | 6,000 | 1,271 |
| New Khata | Documentation | 15,000 | 20,000 | 4,237 |
| Khata Transfer | Documentation | 12,000 | 16,000 | 3,390 |
| BESCOM name change | Documentation | 5,000 | 7,500 | 1,589 |
| Rental agreement | Documentation | 1,000 | 1,500 | — |
| Sale deed / release deed draft | Documentation | 7,500 | 10,000 | 2,119 |
| Sale agreement draft | Documentation | 5,000 | 7,000 | 1,483 |
| Gift deed draft | Documentation | 5,000 | 7,000 | 1,483 |
| MODT cancellation | Legal | 8,000 | 10,500 | 2,225 |
| Due diligence / legal opinion | Legal | 10,500 | 13,500 | 2,860 |
| Tax name change | Legal | 1,000 | 1,500 | 318 |
| EC | Legal | 1,500 | 2,000 | 424 |
| Family tree | Legal | 25,000 | 30,000 | 6,356 |
| MoU | Legal | 2,000 | 3,000 | 636 |
| Registration | Legal | 25,000 | 33,500 | 7,097 |
| Registration package | Legal | 40,000 | 53,500 | up to 10,000 |
| Gram Panchayat khata | Legal | 25,000 | 30,000 | 6,356 |
| Khata correction | Legal | 3,000 | 4,000 | 847 |
| Assignment agreement | Legal | 10,000 | 13,500 | 2,860 |
| Will deed draft | Legal | 5,000 | 7,000 | 1,483 |
| GPA draft | Legal | 5,000 | 7,000 | 1,483 |
| GPA registration | Legal | 30,000 | — | 0 |
| BDA khata | Legal | 25,000 | 30,000 | 6,356 |
| Certified copy | Legal | 2,500 | — | 0 |
| DNV | Legal | 8,000 | 9,000 | 1,907 |
| Doc review (sale agreement) | Legal | 1,500 | — | 0 |
| Gruha Jyothi | Legal | 3,000 | 5,000 | 1,059 |
| BESCOM + Gruha Jyothi | Legal | — | 10,000 | 2,119 |
| Sale agreement registration | Legal | — | 25,000 | 5,297 |

## 6. What's scaffolded so far

Routes for `/legal-doc` (redirects to `/legal-doc/lead`), `/legal-doc/lead`, `/legal-doc/qualify`,
`/legal-doc/service`, `/legal-doc/home`, and `/legal-doc/agent/:id`; a "Home" sidebar item plus a
"Legal & Doc" dropdown group (Leads / Qualify / Service); and 33 seed agent records in
`mockLegalDoc.js` matching the schema above (24 of them lead-stage, spread across the status list
in §3), persisted to `localStorage` so edits survive a refresh. Three records (`CPC287`, `CPC402`,
`CPC212`) are hand-written "showcase" examples rather than generated — `CPC287` has a named client
with documents and a part-negotiated price, `CPC402` shows the agent-as-POC pattern mid-service,
and `CPC212` has two different named clients on the same request each wanting their own service
(the multi-client case the schema exists to support).

`LegalDocLeadsPage.jsx` is the built-out one — filters, pagination, a click-to-open side panel
covering every action (status change, adding/logging calls for a client, adding a client, adding a
service). `LegalDocListPage.jsx` (qualify/service) and `LegalDocHomePage.jsx` are still
first-pass/blank. `LegalDocPage.jsx` (the per-agent detail view) has a first-pass layout matching
the new schema but no editing — read-only.

The Agent Status box shows only the single most recent `legalAndLoan.notes` entry (not the full
history) — a pill + text if it carries a status, or a plain line set off with a left border if it's
a general comment. There's no "+ Add note" control on this page — `addAgentNote()` exists in the
data layer but nothing here calls it; adding a note is for the per-agent detail page
(`LegalDocPage.jsx`) or later. Qualify and Service still need the same side-panel treatment as
Leads.
