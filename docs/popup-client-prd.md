# Product Requirements Document — Popup Delivery on App & Web

| | |
|---|---|
| **Product area** | ACN — Agent App (iOS/Android) & Web |
| **Document owner** | Samarth Jangir |
| **Status** | Draft for review |
| **Version** | 1.0 |
| **Last updated** | 9 September 2026 |
| **Reviewers** | Engineering (App, Web, Platform) · Design · Product · Data |
| **Companion document** | *In-Product Popup System* — the authoring, targeting and measurement spec. This document covers only what the client surfaces must build. |

---

## 1. Summary and scope

The popup system lets Marketing place a message in front of an agent inside the product without a release. That capability is only real if the **clients** — the app and the web front-end — can render a popup they have never seen before, fire it at the right moment, and report what happened.

This document specifies that client behaviour: what each surface asks the server, when a popup appears, exactly how it renders, what a dismissal means, and which events are emitted. Everything here is designed around one rule:

> **The server decides. The client renders and reports.**

The client holds no targeting logic, no frequency logic and no priority logic. That keeps eligibility consistent between phone and desktop, lets rules change without an app release, and means a popup can be stopped centrally.

### In scope

- Fetching popup configuration and rendering it natively on both surfaces
- Detecting the four trigger moments and firing the correct popup
- Dismissal behaviour, including gestures
- Emitting impression, click and dismissal events reliably
- Failure and degradation behaviour when the service or a creative is unavailable

### Out of scope

- Authoring, approval, targeting rules and reporting (companion document)
- Any client-side decision about *whether* an agent should see a popup
- Counting triggers ("N actions in a window") — server capability, deferred

---

## 2. Responsibility split

| Concern | Server | Client |
|---|---|---|
| Which popup an agent is eligible for | ✅ Decides | — |
| Cohort membership | ✅ Evaluates | — |
| Frequency caps, minimum gap, suppression | ✅ Enforces | — |
| Priority between competing popups | ✅ Resolves | — |
| Detecting the moment (session, page, scroll, event) | — | ✅ Detects |
| Rendering the popup | — | ✅ Renders |
| Dismissal and navigation | — | ✅ Handles |
| Emitting events | — | ✅ Emits |
| Counting impressions against the cap | ✅ Records | Reports only |

**Consequence worth stating plainly:** a client must never suppress, delay or re-order a popup it has been given, and must never show one it has not been given. If the client believes a popup should not appear, that is a server bug to fix, not a client-side guard to add — client-side guards are exactly what makes cross-device behaviour inconsistent.

---

## 3. Integration contract

### 3.1 Requesting eligibility

The client asks for eligibility at each moment that can produce a popup, passing the surface, the context and the authenticated agent.

**Request parameters**

| Parameter | Required | Notes |
|---|---|---|
| `surface` | Yes | `app` or `web`. Fixed per client build. |
| `page_key` | For page and scroll moments | `home`, `properties`, `my_business`, `service` |
| `event_key` | For event moments | e.g. `add_inventory_success` |
| `trigger` | Yes | `session`, `page`, `scroll`, `event` |
| `device` | Yes | `mobile` or `desktop`, for reporting |

Authentication identifies the agent; the agent identifier is never passed in a query string.

**Response**

The server returns at most one popup to show now, plus any scroll-triggered popups for the current page so they can fire without a further round trip:

| Field | Notes |
|---|---|
| `popup` | The popup to render immediately, or null |
| `scroll_popups[]` | Popups armed for this page, each with its scroll threshold |

**Per popup, the client receives** its identifier, surface, layout template, creative URL, backdrop opacity, close-control corner, divider label, action-area colour (app), post-action toast text, and for each CTA: label, background colour, label colour, destination URL and tracking key.

The client renders whatever it is given. **Unknown layout templates must be ignored, not guessed** — if a template key is unrecognised, the client skips the popup silently and reports nothing. This lets the CMS ship a new layout to newer clients without breaking older ones.

### 3.2 Reporting events

Three events, described in §7. Events are fire-and-forget from the agent's point of view: no interaction ever waits on a network call.

---

## 4. Runtime lifecycle

### 4.1 Session start

1. On the first authenticated load of a session, request eligibility with `trigger=session`.
2. If a popup is returned, render it and emit `impression`.
3. If none is returned, do nothing. Do not retry within the session.

**A session** is a fresh authenticated entry into the product: app launch from cold or from background after the session timeout, or a web page load in a new tab or after re-authentication. The exact timeout matches the existing session definition for each platform — it is not redefined here.

### 4.2 Page context

1. On landing on a supported page (including client-side route changes on web), request eligibility with `trigger=page` and the `page_key`.
2. Render the returned popup and emit `impression`.
3. Store the returned `scroll_popups[]` for that page and arm a scroll listener.

A route change away from the page disarms the listener and discards the armed popups.

### 4.3 Scroll depth

1. Using the armed popups from the page request, monitor scroll depth as a percentage of the scrollable content.
2. When depth first crosses a popup's threshold **and no popup is currently on screen**, render it and emit `impression`.
3. A given armed popup fires at most once per page visit, regardless of scrolling back up and down again.

Requirements: depth is computed against total scrollable height, not viewport position; the listener is throttled to avoid layout thrash; and a popup already dismissed in this page visit is not re-shown.

### 4.4 Event

1. After a qualifying user action **succeeds** — never on submission, only on confirmed success — request eligibility with `trigger=event` and the `event_key`.
2. Render the returned popup and emit `impression`.

If the action's success screen or toast is already showing, the popup appears after it, not on top of it.

### 4.5 One popup at a time

A client must never display two popups simultaneously, and never stack them. If a moment produces a popup while one is already on screen, the new one is discarded — not queued. It will be offered again the next time that moment occurs.

---

## 5. Rendering — App

The app popup is an anchored sheet over a dimmed backdrop. Geometry is specified at 390pt width and scales proportionally.

| Element | Specification |
|---|---|
| Backdrop | Dimmed overlay across the entire screen, including app chrome, at the configured opacity (default 60%) |
| Close control | 36pt circular control, horizontally centred, 12pt above the sheet |
| Poster | The creative, fixed 39:50 (390 × 500pt), full-bleed to the sheet's width, corners rounded at the sheet's top |
| Action area | Solid block beneath the poster in the configured colour; 18pt side padding, 12pt top padding |
| Divider | Centred label with a star-and-rule treatment either side; 300pt row; label in Inter Medium 14 / 1.5, `#E5E5E5` |
| CTAs | 354pt wide, 48pt tall, 8pt radius, stacked 11pt apart, 12pt below the divider; labels in Inter Medium 16 |
| Home indicator | Rendered on the action area's colour, not on the system background |
| Safe areas | The sheet respects the bottom safe-area inset; the action area extends into it with its own colour |

**Motion.** The sheet enters by sliding up from the bottom edge, with the backdrop fading in; it leaves by reversing. Duration 250 ms, standard platform easing. The backdrop fade and sheet slide are simultaneous.

**Gestures.** Dragging the poster downward dismisses the sheet. Dragging beyond a third of the sheet's height, or releasing with downward velocity, commits the dismissal; anything less springs back. The action area is not a drag surface — a drag starting on a CTA is a press, not a swipe.

**Dismissal surfaces:** close control, downward swipe, backdrop tap, and the platform back gesture or button.

---

## 6. Rendering — Web

The web popup is a centred landscape card over a dimmed page. Geometry is specified at 910pt card width and scales proportionally.

| Element | Specification |
|---|---|
| Backdrop | Dimmed overlay across the viewport at the configured opacity |
| Card | 910 × 436 (fixed ratio), 12pt radius, centred; capped so it never exceeds the viewport, scaling down proportionally on small windows |
| Banner | The creative fills the entire card. Never cropped or letterboxed |
| Close control | 30 × 30pt, 8pt inset from the configured top corner, inside the card |
| CTA well | 420pt wide, inset 48pt from the card's left edge; the block is anchored **48pt above the card's base** and grows upward, so a single CTA occupies the lower position |
| Divider | Label left-aligned, followed by a star and a rule filling the remaining width; 21pt row, 12pt above the CTAs |
| CTAs | 420 × 48pt, 8pt radius, stacked 11pt apart |

**Motion.** The card fades and scales in from 96% to 100% over 200 ms as the backdrop fades; exit reverses.

**Focus and keyboard.** Opening the popup moves focus to the card and traps it there. Tab cycles the CTAs and the close control. `Esc` dismisses. Focus returns to the element that held it before the popup opened.

**Dismissal surfaces:** close control, backdrop click, `Esc`.

**Responsive floor.** Below the width at which the card would scale under 480pt, the popup is not shown and no impression is emitted — a popup too small to read is worse than no popup. This threshold is a product decision, recorded as OQ-3.

---

## 7. Event emission

### 7.1 The three events

| Event | Emitted | Timing rule |
|---|---|---|
| `impression` | The popup is visible to the agent | **After the creative has painted**, not when the response arrives |
| `cta_click` | A CTA is activated | Emitted **before** navigation, with the CTA's tracking key |
| `close` | The popup is dismissed | With the dismissal method: close control, backdrop, swipe, `Esc`, or back |

Every event carries popup ID, agent, surface, page key, device and timestamp.

### 7.2 Rules that protect the numbers

1. **One impression per appearance.** Re-renders, rotation, resize, or a React/Compose recomposition must not produce a second impression. The impression is tied to the appearance, not to the render.
2. **No impression without a visible creative.** If the creative fails to load, the popup is not shown and no impression is emitted (§8.2). An impression that the agent never saw corrupts every rate derived from it.
3. **Click before navigation.** The event is queued before the destination opens, so a navigation that unloads the page does not lose it.
4. **A click is not a dismissal.** Tapping a CTA closes the popup but does not emit `close`.
5. **Queue and retry offline.** Events are persisted locally and flushed when connectivity returns, with de-duplication by event identifier so a retry cannot double-count.
6. **Never block on reporting.** No dismissal, navigation or render waits for an event call to complete.

---

## 8. Failure and degradation

### 8.1 Service unavailable or slow

| Condition | Behaviour |
|---|---|
| Eligibility request fails | No popup. No error surfaced to the agent. No retry within that moment. |
| Eligibility request exceeds its budget (§9) | Abandon it. A popup that arrives late is not shown. |
| Malformed or partial configuration | Skip the popup silently; report a client-side diagnostic, not an agent-visible error |
| Unrecognised layout template | Skip silently (§3.1) |

The product must never be blocked, delayed or visually degraded by the popup system. **A popup failing to appear is an acceptable outcome; a popup breaking a page is not.**

### 8.2 Creative unavailable

The creative is the popup — an empty frame with a floating CTA is worse than nothing. If the image fails to load or exceeds a reasonable load budget, the popup is discarded before it becomes visible and no impression is emitted.

### 8.3 Kill switch

When a popup is turned off centrally it stops being served on the next eligibility request. Clients must not cache eligibility responses beyond the moment they were requested for, so nothing that has been switched off can appear from a cache.

---

## 9. Performance requirements

| # | Requirement | Target |
|---|---|---|
| P-1 | Eligibility resolution is imperceptible on page or session load | ≤ 100 ms p95 server-side; client abandons after its budget and shows nothing |
| P-2 | Scroll popups fire with no network call at the threshold | Armed with the page payload |
| P-3 | Popup rendering does not delay page interactivity | Rendered after the page is interactive; never on the critical path |
| P-4 | Scroll monitoring does not cost frames | Throttled; no synchronous layout reads per scroll event |
| P-5 | Creative weight is bounded | ≤ 2 MB, CDN-served, decoded off the main thread where the platform allows |
| P-6 | Event reporting is invisible to the agent | Asynchronous, batched, retried in the background |

---

## 10. Accessibility

| Requirement | Applies to |
|---|---|
| CTAs are native controls with their label exposed to assistive technology | Both |
| Minimum 48pt tap target on every CTA and the close control | Both |
| The close control is always present and never suppressible by configuration | Both |
| Focus moves into the popup on open and returns on close | Web |
| Focus is trapped while the popup is open | Web |
| `Esc` dismisses | Web |
| The popup is announced when it appears | Both |
| Content behind the popup is not reachable by keyboard or screen reader while it is open | Web |
| Reduced-motion preference respected — the popup appears without slide or scale animation | Both |
| Dismissal is achievable without a gesture | App — the close control satisfies this for agents who cannot swipe |

The creative is an image and its content cannot be read by assistive technology. The system layer therefore carries the actionable meaning: the CTA labels must make sense without the artwork. This is an authoring guideline enforced at review, and a reason the CTA is never baked into the image.

---

## 11. Edge cases

| Case | Required behaviour |
|---|---|
| Agent rotates the device | Popup persists and re-lays out; no new impression |
| Window resized on web | Card rescales; no new impression; if it falls below the responsive floor, it closes without emitting `close` |
| App backgrounded and resumed within the session | Popup persists; no new impression |
| App resumed after session timeout | Treated as a new session; the session moment may produce a popup |
| Two web tabs open | Each is its own session for triggering, but server-side suppression means the same popup does not appear twice; a dismissal in one tab holds for subsequent requests in the other |
| Agent scrolls back up and down again | An armed popup fires at most once per page visit |
| Popup already on screen when another moment fires | New popup discarded, not queued (§4.5) |
| Back gesture or button while popup is open | Dismisses the popup only; does not navigate |
| Deep link into a page | The page moment fires normally |
| Slow creative | Popup withheld; no impression (§8.2) |
| Agent signs out while a popup is open | Popup closes immediately; no `close` event |
| Destination URL fails to open | The popup still closes; the click is already reported |

---

## 12. Acceptance criteria

Each phase is done when the following can be demonstrated on both surfaces.

**Phase 1 — Rendering**
- A popup configured centrally renders on app and web without a client release
- Geometry matches the specification at three device widths per surface, with the CTA correctly positioned at each
- All three layout templates render, including no-button, where the whole creative is the target
- An unrecognised template is skipped silently
- Every dismissal surface works, including gesture on app and `Esc` on web

**Phase 2 — Triggers**
- Each of the four moments fires the correct popup
- Scroll popups fire at the configured depth with no network call
- Event popups fire only on confirmed success
- Two popups never appear at once

**Phase 3 — Reporting and resilience**
- Impressions, clicks and dismissals match a scripted interaction sequence exactly, with no duplicates across rotation, resize and re-render
- No impression is recorded when a creative fails to load
- Events queued offline are delivered once, and only once, on reconnect
- A failed or slow eligibility call leaves the product visually and functionally unchanged
- A popup switched off centrally stops appearing on the next moment

---

## 13. Open questions

| # | Question | Needed for | Owner |
|---|---|---|---|
| OQ-1 | Is the app native or a webview, and what are the exact route identifiers for each supported page? | Phase 1 | App engineering |
| OQ-2 | Which client callbacks reliably indicate confirmed success for each event trigger? | Phase 2 | App / Web engineering |
| OQ-3 | At what viewport width should the web popup stop being shown rather than scaled down? | Phase 1 | Design |
| OQ-4 | Do the enter and exit animations match the platform's existing sheet and modal patterns, or does the popup get its own? | Phase 1 | Design |
| OQ-5 | Should a popup dismissed by the back gesture be recorded differently from one dismissed by the close control? | Phase 3 | Product |
| OQ-6 | What is the client's timeout budget for an eligibility request before it abandons? | Phase 1 | Engineering |
| OQ-7 | Do older app versions need a minimum-version gate, so a popup using a newer layout is simply not served to them rather than skipped client-side? | Phase 1 | Platform |

---

## 14. Glossary

| Term | Definition |
|---|---|
| **Moment** | An occasion that can produce a popup: session start, page context, scroll depth, or a successful event |
| **Armed popup** | A scroll-triggered popup delivered with the page payload, waiting for its threshold |
| **Appearance** | One continuous display of a popup; the unit an impression is tied to |
| **System layer** | Everything the client draws around the creative: backdrop, close control, divider, CTAs |
| **Creative** | The uploaded image — the poster on app, the banner on web |
| **Responsive floor** | The viewport width below which the web popup is withheld rather than scaled |
