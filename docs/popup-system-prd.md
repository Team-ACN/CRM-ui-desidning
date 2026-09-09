# Product Requirements Document — In-Product Popup System

| | |
|---|---|
| **Product area** | ACN — Agent App & Web, CMS |
| **Document owner** | Samarth Jangir |
| **Status** | Draft for review |
| **Version** | 2.0 |
| **Last updated** | 9 September 2026 |
| **Reviewers** | Design · Engineering (App, Web, Platform) · Marketing · Data |

**Changes in v2.0** — the web experience is now specified from design (§6.2), closing the open question that stood in v1. The web creative changes from a 4:3 card to a 910:436 banner. Frequency control is simplified to a single gap setting (§7.4). Poster colour matching is confirmed as app-only (§10.2). The post-action toast is authored text and applies to both surfaces (§10.3).

---

## 1. Executive summary

ACN has no controlled way to place a message in front of an agent inside the product. Campaigns that need in-product reach today require an engineering ticket and ride an app release: a two-to-four week lead time, no ability to stop a live message, and no measurement once it ships.

This document specifies a **popup system**: a configuration-driven overlay that Marketing authors, a reviewer approves, and the product serves to a targeted audience at a defined moment — with no code change and no release dependency.

The decision at the centre of the product is that **the creative is a single uploaded image, and the system renders everything interactive around it**. Marketing already produces polished creative; the product supplies the call-to-action buttons, the close control, the backdrop and the measurement. This removes the need for a layout editor while keeping the CTA accessible, trackable, and impossible to crop.

The system is governed by four safety rules that apply to every popup regardless of author: one popup per view, capped frequency by default, suppression once acted upon, and an approval gate before anything reaches an agent.

---

## 2. Context and problem statement

### 2.1 Current state

| Need | How it is met today | Cost |
|---|---|---|
| Announce a feature in-product | Hard-coded screen, shipped in a release | 2–4 weeks; cannot be changed after ship |
| Reach a specific agent segment | Not possible in-product; falls back to WhatsApp / email | Low open rates, no in-context relevance |
| Stop a message that is underperforming | Requires a hotfix or a forced app update | Effectively not possible |
| Measure a message | Ad hoc, if at all | No CTR, no dismissal data, no comparison |

### 2.2 Why now

Three initiatives in the current roadmap each need in-product placement within the quarter: delisting prevention nudges, plan upgrade prompts, and new-launch announcements. Absent a shared system, each will be built separately, and none will be measurable or safely stoppable.

### 2.3 The risk of getting this wrong

A popup system is a shared channel with no natural back-pressure. If several teams can each place overlays without constraint, the agent experience degrades quickly and agents learn to reflex-dismiss anything that appears — which also destroys the value of genuinely useful interventions such as delisting prevention. **The governance rules in §9 are therefore product requirements, not implementation details.**

---

## 3. Goals and non-goals

### 3.1 Goals

| # | Goal | Measured by |
|---|---|---|
| G1 | Ship an in-product message without an engineering ticket or release | Median time from brief to live < 1 working day |
| G2 | Target a message to a defined audience and moment | ≥ 80% of live popups use a cohort or a contextual trigger, not a blanket session trigger |
| G3 | Make every message measurable | 100% of live popups report impressions, CTR and dismissal rate |
| G4 | Protect the agent experience from message fatigue | Portfolio dismissal rate stays below 65%; no agent sees more than one popup per view |
| G5 | Stop or change a live message immediately | Time from decision to a popup being off < 2 minutes |

### 3.2 Non-goals for v1

- **A design editor.** No text, layout, or composition tooling. The image carries the design.
- **Blocking interstitials.** Popups are dismissible overlays; nothing blocks an agent from reaching the product.
- **Behavioural counting triggers** ("5 enquiries in one day", "status unchanged for N days"). Deferred to Phase 4; requires aggregation infrastructure.
- **A/B variant testing**, conversion attribution beyond the click, and a full change audit log.
- **A new segmentation engine.** Cohorts already exist as a platform capability; this system consumes them.
- **Cohort exclusions and multi-cohort targeting.** The data model reserves room; the v1 experience targets one cohort or everyone.

---

## 4. Users and use cases

| Persona | Need | Frequency |
|---|---|---|
| **Marketing manager** (author) | Launch a campaign message to a segment, see whether it worked | Weekly |
| **Product / QC reviewer** (approver) | Check a message renders correctly and is targeted sanely before it reaches agents | Per popup |
| **Growth / Ops** (author) | Nudge behaviour at a moment of intent — e.g. after an agent adds inventory | Fortnightly |
| **Agent** (recipient) | Understand the message in under three seconds; act or dismiss without friction | Passive |

### Representative use cases

1. **Feature announcement** — new launch inventory goes live; announce it on the app home screen to agents in the relevant micro-market, once each.
2. **Moment-of-intent nudge** — an agent has just added inventory; offer a paid boost immediately after success, up to four times with a minimum two-hour gap.
3. **Retention nudge** — agents at risk of delisting see a reminder at 50% scroll on My Business, once, on web.
4. **Plan upgrade** — rental-focused agents see an upgrade prompt on the Properties page.

---

## 5. Solution overview

### 5.1 The creative model

A popup is composed of two layers:

1. **The artwork layer** — one image supplied by Marketing, carrying all design, copy and art. It is produced with an area deliberately left clear for the call to action.
2. **The system layer** — the backdrop, the close control, the divider label and the CTA button(s), rendered natively by the product and configured per popup (label, colours, destination, tracking key).

**Why the CTA is not baked into the image.** Three reasons, each of which has broken image-only implementations elsewhere: a rendered button cannot be clipped by cropping or scaling; a native button is a real focusable control with a correct tap target and screen-reader label; and a native button is independently trackable, so click-through can be attributed per CTA rather than inferred.

### 5.2 One system, two surfaces

The App and the Web are treated as **separate delivery surfaces with separate content**. A popup belongs to exactly one surface. It carries a creative shaped for that surface, renders with the anatomy appropriate to that surface, and competes for placement only against popups on the same surface.

This is deliberate. A shared record with per-surface overrides was considered and rejected: the two surfaces have different creative shapes, different traffic volumes and different campaign calendars, and a shared record makes it impossible to answer "what is running on the app right now?" without mental filtering.

App leads throughout the experience — it carries most agent traffic and is the default surface for a new popup.

---

## 6. Experience specification

Both surfaces share the same principle: a fixed-ratio creative, with the divider and CTAs drawn by the system. Where they differ is **placement of the system layer** — beneath the creative on app, over a reserved area of the creative on web. That difference comes from the two designs, not from a technical constraint.

### 6.1 App — anchored sheet

The app popup is anchored to the bottom of the screen over a dimmed backdrop.

```
              ( × )                   ← close control, centred above the sheet
   ┌───────────────────────────┐
   │                           │
   │      POSTER  390 × 500    │      ← artwork, 39:50, full width
   │                           │
   ├───────────────────────────┤      ← no visible seam
   │  ✦ ─── TRY IT YOURSELF ─── ✦ │   ← divider label (authored text), centred
   │  [      Primary CTA      ] │
   │  [     Secondary CTA     ] │
   └───────────────────────────┘
```

| Element | Requirement |
|---|---|
| Backdrop | Dimmed overlay across the full screen, including product chrome. Default opacity 60%. |
| Close control | 36pt circular control, centred horizontally, 12pt above the sheet. Always present. |
| Poster | Fixed 39:50 ratio (390 × 500pt), full-bleed to the sheet edges. Never cropped or letterboxed. |
| Action area | Solid colour block beneath the poster, holding the divider and CTAs. Its colour **must match the poster's bottom edge** so poster and action area read as a single surface (§10.2). Side padding 18pt. |
| Divider | Rule-and-star treatment either side of a centred label. Label text is authored; typography is fixed (Inter Medium 14 / 1.5, `#E5E5E5`). |
| CTAs | 354pt wide, 48pt tall, 8pt corner radius, stacked 11pt apart, 12pt below the divider. Label typography fixed (Inter Medium 16); label text and colours authored. |
| Home indicator | Sits on the same solid colour as the action area. |
| Dismissal | Close control, or swiping the poster downward. |

**Rationale for the anchored sheet over a centred card:** the anchor keeps the CTA within thumb reach, and the fixed poster ratio means the artwork is never cropped across device sizes — the variable space is absorbed by the backdrop, not the creative.

### 6.2 Web — banner card

The web popup is a centred landscape card over a dimmed page. **The banner is the whole card**, and the system draws the divider and CTAs over it, inside an area the artwork leaves clear.

```
   ┌───────────────────────────────────────────────( × )┐
   │                                                    │
   │   BANNER  910 × 436          ← artwork fills the card
   │                                                    │
   │   TRY IT YOURSELF ✦────────────                    │
   │   [        Primary CTA        ]                    │
   │   [       Secondary CTA       ]   ← 48pt above base │
   └────────────────────────────────────────────────────┘
```

| Element | Requirement |
|---|---|
| Card | 910 × 436 (fixed ratio), 12pt corner radius, centred on a dimmed page. Capped so it never dominates a large viewport. |
| Banner | The artwork fills the entire card. Never cropped or letterboxed. |
| Close control | 30 × 30pt, 8pt inset from the top corner, inside the card. Corner is configurable; presence is not. |
| CTA well | The area the artwork must leave clear: 420pt wide, inset 48pt from the left edge. |
| Well anchoring | The block is anchored to its **bottom edge, 48pt above the card's base**, and grows upward. A single CTA therefore sits in the lower position, where the second CTA would be. |
| Divider | Label **left-aligned**, followed by a star and a rule filling the remaining width. 21pt row, 12pt above the CTAs. Typography fixed as on app. |
| CTAs | 420 × 48pt, 8pt corner radius, stacked 11pt apart. Typography fixed; label text and colours authored. |
| Dismissal | Close control or backdrop click. |

**Why the well rather than a strip beneath the banner:** the web creative is landscape and its right side carries the art, so the CTA belongs in the composition's left column. A strip beneath would add height to an already wide card and break the design's balance. The trade-off is that the artwork must respect the well — which the published design template and the authoring guides (§10.4) enforce.

### 6.3 Layout templates

Authors choose from a fixed set. Templates are a system-owned registry, not a free-form editor.

| Template | CTAs | App | Web |
|---|---|---|---|
| **No button** | 0 | The poster itself is the link | The banner itself is the link |
| **One button** | 1 | Single CTA in the action area | Single CTA in the lower well position |
| **Two buttons** | 2 | Primary and secondary, stacked | Primary and secondary, stacked in the well |

With **No button**, no divider is drawn and no action area is rendered.

Adding a template is a design-plus-engineering change, not an authoring capability. Each template ships with a matching Figma/Canva template so designers produce artwork that respects the reserved area.

---

## 7. Configuration model

Fields marked *System* are not author-editable.

### 7.1 Identity and creative

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| Name | Text | Yes | — | Internal only; never shown to agents |
| Surface | `App` \| `Web` | Yes | App | Determines creative shape, anatomy and competition set |
| Creative | Image | Yes | — | App: 39:50, min 780 × 1000. Web: 910:436, min 1820 × 872. PNG/JPEG/WebP, ≤ 2 MB |
| Layout template | Enum | Yes | One button | See §6.3 |
| Backdrop opacity | % | System | 60% | Fixed for consistency across popups |
| Close corner | Enum | Yes | Top right | Web only; app's close control is always centred above the sheet |

Below-minimum dimensions produce a warning, not a block — the author may knowingly use a smaller asset.

### 7.2 Call to action

| Field | Type | Required | Default | Applies to | Notes |
|---|---|---|---|---|---|
| Divider label | Text | No | "TRY IT YOURSELF" | Both | Text authored; typography fixed |
| Action area colour | Colour | Yes | Auto-matched | App only | Derived from the poster; manual override available (§10.2) |
| Toast message | Text (≤ 80 chars) | No | Empty | Both | Shown after a CTA tap; empty means no toast |

### 7.3 Per CTA

| Field | Type | Required | Notes |
|---|---|---|---|
| Label | Text | Yes | Kept short; the button does not wrap |
| Background colour | Hex | Yes | Contrast-checked against the label colour |
| Label colour | Hex | Yes | Contrast-checked against the background |
| Destination URL | URL | Yes | Must be `http(s)` |
| Tracking key | Slug | Yes | Stable identifier for reporting; renaming starts a new series (§11.4) |

### 7.4 Targeting and delivery

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| Trigger type | Enum | Yes | Session start | See §8 |
| Page | Enum | Conditional | — | Required for page and scroll triggers |
| Scroll depth | 1–100% | Conditional | 50% | Required for scroll trigger |
| Event | Enum | Conditional | — | Required for event trigger |
| Audience | Cohort or "All users" | Yes | All users | One cohort in v1, chosen from a searchable list |
| Max shows per user | Integer ≥ 1 | Yes | **1** | Capped by default |
| Minimum gap | Hours | No | None | Minimum wait before this agent sees a popup again |
| Priority | Integer | Yes | Lowest | Rank within its competition set (§9.3) |

**On the single gap setting.** v1 had two overlapping controls — a per-popup cooldown and a cross-popup minimum gap. Authors could not reliably distinguish them, and the stricter of the two always governed in practice. They are collapsed into one **Minimum gap**. The precise scope of that gap is an open question (§14.3, OQ-4): as specified today it is the wait before the agent sees a popup again, which is the stricter reading and the safer default for agent experience.

---

## 8. Triggers

Exactly one trigger per popup. Combining triggers was rejected for v1: it multiplies the eligibility surface without a demonstrated need, and a second popup can express the second moment.

| Trigger | Fires | Required configuration | Phase |
|---|---|---|---|
| **Session start** | First authenticated load of a session | — | 1 |
| **Page context** | On landing on a specified page | Page | 1 |
| **Scroll depth** | When the agent passes a scroll threshold on a page | Page, depth % | 1 |
| **Event** | Immediately after a user action succeeds | Event key | 1 |
| **Counting** | "N actions within a time window" | Aggregation definition | 4 — deferred |

**Supported pages:** Home, Properties, My Business, Service.
**Supported events (initial):** inventory added, enquiry submitted, profile completed. The event list expands as the clients expose success callbacks; each addition is configuration, not a schema change.

Scroll-triggered popups must be resolved and delivered to the client **with the page payload**, not fetched when the threshold is crossed, so the popup appears without a perceptible delay.

---

## 9. Governance and delivery rules

These rules are load-bearing. Multiple teams author into a shared channel, and the rules are what prevent that channel from degrading.

### 9.1 One popup per view

If several popups qualify for the same moment, exactly one is shown. The others are suppressed for that view and are not queued — they compete again the next time the moment occurs.

### 9.2 Capped by default

A popup created without frequency configuration shows **once per agent, ever**. Authors raise the cap deliberately. This inverts the common failure mode where an unconfigured popup shows on every qualifying view.

### 9.3 Priority within a competition set

A *competition set* is the combination of **surface and trigger context** — for example, "App · Home page" or "Web · My Business page at 50% scroll". Popups are ranked only within their set, because only popups in the same set can ever contend for the same view.

Ranking is a deliberate, two-step action: reordering happens on a dedicated ranking screen, scoped to one surface, and takes effect only when explicitly saved. An accidental drag must never change what live traffic sees.

### 9.4 Suppression

A popup stops being eligible for an agent when any of the following is true: the maximum number of shows is reached, the minimum gap has not yet elapsed, the agent dismissed it, or the agent completed the target action. Suppression state is **stored server-side, per agent** — an agent uses ACN on both phone and desktop, and a dismissal on one must hold on the other.

### 9.5 Approval gate

No popup reaches an agent without a reviewer approving it. Approval takes place on the ranking screen, where the reviewer sees the popup rendered as an agent will see it, alongside its targeting and frequency configuration. Ranking and approval share one screen because both are decisions about what an agent will actually be shown.

### 9.6 Eligibility resolution order

For a given agent, surface and moment, the system evaluates gates **in order** and stops at the first failure:

1. **Status** — the popup is Live.
2. **Surface and trigger** — the popup's surface matches, and its trigger matches the current page, scroll depth or event.
3. **Audience** — the agent is in the target cohort, or the popup targets all users.
4. **Frequency and suppression** — under the maximum number of shows; past the minimum gap; not dismissed; not completed.
5. **Priority** — the highest-priority survivor wins; the rest are suppressed for this view.

The audience gate deliberately precedes the frequency gate: cohort membership is a cheap filter that removes most candidates before per-agent state is read.

---

## 10. Quality guardrails

### 10.1 Accessibility

| Requirement | Standard |
|---|---|
| CTA label legibility | Contrast ratio ≥ 4.5:1 (WCAG 2.1 AA) between label and button background |
| Tap target | Minimum 48pt height on all CTAs |
| Close control | Always present, never suppressible by configuration, with an accessible label |
| Screen readers | CTAs are native controls, announced with their label and destination |

**Contrast is computed and surfaced at authoring time.** Relative luminance follows WCAG 2.1: each channel is normalised to 0–1, linearised (`c ≤ 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4`), and combined as `0.2126·R + 0.7152·G + 0.0722·B`. The ratio is `(L_lighter + 0.05) / (L_darker + 0.05)`. Results are graded AAA (≥ 7:1), AA (≥ 4.5:1) or Fail, shown live next to the colour controls.

A failing ratio produces a prominent warning rather than a hard block — the author may have a deliberate reason — but it is visible to the reviewer at approval, which is where it should be caught.

### 10.2 Poster-matched action area (App)

The app's action area sits beneath the poster and must appear to be part of the artwork. Requiring the author to eyedrop and type a hex value is error-prone and was rejected.

**The system derives the colour from the artwork automatically.** On upload, it samples the **bottom 4% of the image's height across the middle 60% of its width** and averages the result. The horizontal inset matters: corners commonly carry rounding, vignetting or a signature, and including them pulls the average away from the true edge colour.

The derived colour is shown to the author as "matched", with a manual override available for artwork whose bottom edge is a gradient or a photograph. Where a creative cannot be read for colour, the previous value is retained and the author is prompted to set it manually.

This applies to **app only**. Web draws its CTAs over the banner and has no separate colour surface.

### 10.3 Post-action feedback

A CTA tap must produce a visible response, not just a navigation. The authored toast message appears above the popup — never over the CTA that triggered it — using system typography. Authors write the message; the presentation is fixed. Applies to both surfaces.

### 10.4 Artwork alignment

Because the system draws the CTAs, the artwork must leave the corresponding area clear — the action-area seam on app, the CTA well on web. Two mechanisms enforce this:

1. **Published design templates**, one per layout, with the reserved area marked, so creative is produced correctly.
2. **A guide overlay in authoring** that outlines the reserved area, the CTA positions and the close control's zone over the uploaded creative, so a misaligned asset is caught before approval.

---

## 11. Measurement

### 11.1 Event taxonomy

Three events per popup. Each carries popup ID, agent ID, surface, page, device and timestamp.

| Event | Emitted when | Additional properties |
|---|---|---|
| `impression` | The popup becomes visible to the agent | — |
| `cta_click` | A CTA is tapped, before navigation | Tracking key of the CTA tapped |
| `close` | The popup is dismissed — close control, backdrop click, or swipe-down on app | Dismissal method |

Events are recorded per agent, which allows every metric below to be sliced by cohort retrospectively — including for cohorts defined after the campaign ran.

### 11.2 Per-popup metrics

| Metric | Definition | Formula |
|---|---|---|
| **Impressions** | Times the popup was rendered | `count(impression)` |
| **Total clicks** | Taps across all CTAs on the popup | `Σ cta_click` across tracking keys |
| **Click-through rate (CTR)** | Clicks per impression | `total clicks ÷ impressions` |
| **Dismissal rate** | Share of impressions dismissed | `closes ÷ impressions` |
| **CTA clicks** | Taps on one specific CTA | `count(cta_click where tracking_key = k)` |
| **CTA click-through rate** | That CTA's clicks per impression | `CTA clicks ÷ impressions` |
| **Share of clicks** | Attention split between the CTAs | `CTA clicks ÷ total clicks` |

### 11.3 Portfolio metrics (per surface)

Both surfaces are always on screen, side by side, so neither is hidden behind a filter. Each panel is computed over every popup on that surface.

| Metric | Formula |
|---|---|
| **Live popups** | Count of popups with status Live on that surface |
| **Impressions** | `Σ impressions` across the surface's popups |
| **Average CTR** | `(Σ clicks) ÷ (Σ impressions)` |
| **Dismissal rate** | `(Σ closes) ÷ (Σ impressions)` |

**Average CTR is a ratio of sums, not a mean of per-popup rates.** A popup with 12,000 impressions must weigh proportionally more than one with 900; averaging the rates would let a low-volume popup swing the surface figure and mislead a portfolio decision.

### 11.4 Interpretation rules and edge cases

These are stated explicitly because each one has caused a misread in comparable systems:

1. **CTR can exceed 100%.** It is clicks per impression, not clickers per impression — a two-CTA popup can produce two clicks from one impression. A distinct-agent CTR is a Phase 3 addition (§11.5).
2. **CTR and dismissal rate do not sum to 100%.** A CTA tap is not a dismissal, and an agent may leave the popup by navigating away, so a share of impressions resolves as neither.
3. **Zero impressions yields zero, never an error.** Any rate over an empty denominator reports 0.0%, and unlaunched popups are labelled "no data yet" rather than shown as 0% performance.
4. **A renamed tracking key starts a new series.** Historic clicks remain attached to the old key and stop being attributed to the renamed CTA. Renaming a key on a live popup is therefore treated as a breaking change.
5. **Counts are formatted to the Indian numbering system** (12,840 / 1,20,000); rates to one decimal place.

### 11.5 Deferred metrics (Phase 3+)

| Metric | Requires |
|---|---|
| Unique reach (distinct agents who saw the popup) | Distinct-agent aggregation |
| Distinct-agent CTR | Distinct-agent aggregation |
| Suppression breakdown (which gate blocked delivery, and how often) | Gate-level eligibility logging |
| Frequency exhaustion (share of the audience at cap) | Per-agent state reporting |
| Downstream conversion (did the CTA lead to the target action?) | Attribution join with product events |

---

## 12. Non-functional requirements

| # | Requirement | Target |
|---|---|---|
| NFR-1 | Eligibility resolution adds no perceptible delay to a page or session load | ≤ 100 ms p95, resolved server-side |
| NFR-2 | Scroll-triggered popups appear without a round trip at the threshold | Pre-resolved with the page payload |
| NFR-3 | A popup turned off stops being served promptly | ≤ 2 minutes to full propagation |
| NFR-4 | Creative delivery does not degrade a slow connection | ≤ 2 MB per creative; CDN-served; popup never blocks page interactivity |
| NFR-5 | Suppression state is consistent across an agent's devices | Server-authoritative per-agent state |
| NFR-6 | Event loss does not distort reporting | ≤ 1% event loss; impressions and clicks reconciled daily |
| NFR-7 | No personally identifiable data is embedded in popup configuration or destination URLs | Enforced at authoring |
| NFR-8 | The system degrades safely | If eligibility cannot be resolved, no popup is shown; the product is never blocked |

---

## 13. Release plan

| Phase | Scope | Acceptance criteria |
|---|---|---|
| **1 — Renderer** | Popup rendering on App and Web; layout templates; close and CTA behaviour; event emission | A configured popup renders identically across phone sizes and desktop viewports, with the CTA correctly placed at every size; taps route correctly and emit events |
| **2 — Authoring** | Creative upload, layout selection, CTA configuration, contrast guard, poster colour matching, guide overlay, live preview | A non-engineer creates a complete popup end to end without assistance, and the rendered result matches the preview |
| **3 — Orchestration** | Triggers, cohort targeting, frequency and suppression, priority, approval workflow, reporting | Triggers fire on the correct surfaces and moments; frequency and suppression hold across sessions and devices; only one popup ever shows per view; every live popup reports impressions, CTR and dismissal rate |
| **4 — Counting triggers** | Behavioural "N in a time window" triggers | A counting-triggered popup fires within the agreed latency of the qualifying behaviour |

Phases 1–3 constitute a complete, shippable product covering all non-counting placements on both surfaces.

---

## 14. Risks, dependencies and open questions

### 14.1 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Popup fatigue trains agents to reflex-dismiss | Erodes the channel, including retention nudges | One-per-view rule; capped by default; portfolio dismissal rate tracked as a health metric (G4) |
| Artwork does not leave the reserved area clear, and the CTA overlaps the design | Unusable popup reaches agents | Published design templates per layout; guide overlay in authoring; visual check at approval (§10.4) |
| Multiple teams launch into the same moment | Campaigns cannibalise each other | Competition sets are explicit, and ranking within a set is a deliberate, reviewed action |
| Unreadable CTA colours ship | Accessibility failure, lost clicks | Live contrast grading at authoring; visible to the reviewer at approval |
| A single gap setting is interpreted differently by authors and by the server | Under- or over-throttling of the whole channel | Resolve OQ-4 before Phase 3 build; state the chosen scope in the field's help text |
| Channel used for messages better suited to email or WhatsApp | Diminishing returns per popup | Editorial guideline: in-product placement is for in-product actions |

### 14.2 Dependencies

| Dependency | Owner | Needed by |
|---|---|---|
| Cohort membership available at eligibility time | Platform | Phase 3 |
| Client success callbacks for event triggers | App / Web engineering | Phase 3 |
| Confirmed app screen and route identifiers | App engineering | Phase 1 |
| Design templates per layout, with reserved areas marked | Design | Phase 2 |
| Event pipeline and reporting tables | Data | Phase 3 |

### 14.3 Open questions

| # | Question | Needed for | Owner |
|---|---|---|---|
| OQ-1 | Is the post-action toast one confirmation per popup, or one per CTA? | Phase 2 | Product |
| OQ-2 | Should the toast carry an action of its own — an undo, or a link — as the design notes suggest? | Phase 2 | Design |
| OQ-3 | Is the app native or a webview, and what are the exact route identifiers for page triggers? | Phase 1 | App engineering |
| OQ-4 | Does Minimum gap mean "before this popup shows again" or "before any popup shows again"? | Phase 3 | Product |
| OQ-5 | Should audience targeting support multiple cohorts and exclusions, and when? | Phase 3 | Marketing |
| OQ-6 | Who owns the approval decision — Product, Marketing lead, or a rotating reviewer? | Phase 3 | Product |
| OQ-7 | What is the acceptable latency for counting triggers — near-real-time, or is hourly sufficient? | Phase 4 | Growth |

**Closed since v1**

| Question | Resolution |
|---|---|
| Should Web adopt the app's anatomy, or its own? | Resolved from design: web is a 910:436 banner with the CTAs drawn over a reserved well in the artwork (§6.2). The web creative spec changes accordingly. |
| Is the toast an image or text? | Text, authored per popup, system-styled (§10.3). |

---

## 15. Glossary

| Term | Definition |
|---|---|
| **Surface** | A delivery channel: App or Web. A popup belongs to exactly one. |
| **Creative** | The uploaded image carrying the design, copy and art — the *poster* on app, the *banner* on web. |
| **Action area** | The solid block beneath the poster on app, containing the divider and the CTAs. |
| **CTA well** | The area of the web banner the artwork must leave clear, where the system draws the divider and CTAs. |
| **Competition set** | Surface plus trigger context — the group within which popups contend for a single view. |
| **Cohort** | An existing platform-defined segment of agents. |
| **Suppression** | The state in which a popup is no longer eligible for a specific agent. |
| **Tracking key** | A stable identifier on a CTA, used to attribute clicks in reporting. |
