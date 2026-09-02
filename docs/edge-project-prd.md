# Edge Project Page PRD

## 1. Context
Why — Edge is getting a new Project page. The details page is already built; discovery is missing. Agents currently have no way to browse or find projects. This scope adds that layer.
What — Two parts:
(1) add primary RERA projects from Restack into our DB, and
(2) make them discoverable in Edge.
Non-goals
EC (Environmental Clearance) data — next phase. This scope is RERA-only.

## 2. Data Source & Sync
| Item | Requirement |
|---|---|
| Source of truth | Restack DB. Restack scrapes all RERA projects + enriches them. |
| Direction | Restack DB → our DB → publish to Edge |
| Frequency | Daily, full dataset (confirmed with Yash) |
| Timing | Our pull runs 1 hour after Restack's scraper finishes |
| What we ingest | Primary projects only (defined below) |

Primary project (only these are fetched)
Possession date > today
Multi-RERA → judged by max possession date (§3.1); if max > today, it's primary
We never fetch a project whose possession has already passed. (resale, §4.2, is a separate case for projects fetched earlier that later cross their possession date.)

⚠️ Scraper timing — action item. Confirm Restack's scraper start time + run duration. We schedule ours 1 hour after their finish, so we always read complete, fresh data.

## 3. General Rules (the logic we apply)
These are the decision rules used across the feature.

### 3.1 Possession dates
A project can have many RERAs (phases). Each RERA has its own possession (handover) date. Two terms:
- Max possession date = out of all the project's RERA possession dates, the biggest (furthest future) one.
- Closest possession date = out of all the project's RERA possession dates, the nearest future one.

If a project has only one RERA, both are just that one date.

| When | Which date | What we do |
|---|---|---|
| Fetching a project | max possession | Fetch only if max is after today |
| Checking already-saved projects | max possession | If max is before today → change live to resale |
| Showing in Possession section | closest possession | Show the project once, at its nearest future date |

### 3.2 Status shown on card
The card shows the launch stage, mapped from launchStatus:

| launchStatus | Shown as |
|---|---|
| New Launch | Pre-launch |
| Developer | Pre-launch |
| RERA Approved | RERA |

### 3.3 Project name (priority order)
1. If name exists → use name
2. Else if codename exists → use codename
3. Else → Builder + Micromarket

### 3.4 Images
When fetching from Restack, always make sure the one image URL fills both fields: Cover image = Notification image = the FIRST image from Restack. One image, used for both. If Restack updates it, ours updates too.
Master plan = separate image, highest quality. Brochure = separate file.
Loading & performance (own copy, Cloudflare) → see §6.
When updating an image, delete the previous one from our database.

### 3.5 Builder resolution
Restack sends only a builder name (a string). On each sync, per project:

| Case | What we do |
|---|---|
| Name matches an existing builder | Link project to that builder |
| No match | Create a new builder |

The developer list builds itself as projects come in; CMS fills contacts over time.

### 3.6 Refresh
On each sync we match a project by its Restack Project ID and refresh only the fields that come from Restack — and only those fields where Restack actually has data. This way, if we've filled in any missing detail ourselves, it stays visible until Restack provides that data. Our own fields — status (archive/resale), published date — are never overwritten.

### 3.7 Card recency (published date)
The card's "New" tag (published < 24h) and relative date ("3D ago") read the project's published date. On normal ingest that's the publish time (set at creation). On the first backfill only, we set published date = Restack's source date (fallback RERA date), so old projects don't all show as "New". (added-date and updated-date stay internal.)

## 4. Changes to Our Schema
What we change from our current schema, and why.

### 4.1 Multiple RERA per project
Earlier we saved one RERA per project. Our schema had: rera_id, approval_date, completion_date. Now a project can have many RERAs (one per phase). We replace those three fields with one that holds every phase: `phase_details = [{phase_name, rera_id, handover_date, approval_date}, …]`

### 4.2 Project status (was a yes/no)
Earlier isLive was just a yes/no — a project was either drafted (not shown) or live (shown). Now two more situations come up:
- A project's possession date passes. It won't come in the Restack fetch again, but it's already saved with us → we move it to resale so it stays stored but hidden (never shown, never updated).
- Restack data for a project is wrong or duplicate → we manually put it in archive so it stops showing.
A yes/no can't hold these. So the status field needs four values: live, drafted, resale, archive.

### 4.3 Builder as its own table
Earlier the builder sat inside each project (builderName, contact). That means the same builder repeats on every project, we can't keep its contacts in one place, and it arrives under different names so builder counts break. Now the builder is a separate table:

| Field | Note |
|---|---|
| builderId | Primary key |
| builderName | Name |
| builderLogo | — |
| contacts | name, designation, mobile |

Each project stores builderId (link) + rawBuilderName (raw name from Restack). Matching/creating → §3.5.

### 4.4 Restack Project ID column
Add a restackProjectId column on the project. It's the key we match on every sync to refresh the right row (§3.6), and it links each project back to its Restack record.

## 5. Ingestion Flow (top → bottom)
| # | Step | What happens |
|---|---|---|
| 1 | Restack scrapes | All RERA projects scraped + enriched into Restack DB |
| 2 | We read | Read Restack DB, 1h after their scrape finishes |
| 3 | Primary filter | Keep only projects with possession > today (multi-RERA → max). §3.1 |
| 4 | QC check | Reject any record missing a mandatory field (§5.1) |
| 5 | Layout | Work out the layout correctly (§5.2) |
| 6 | Builder resolution | Link to a builder, or create one (§3.5) |
| 7 | Fetch fields | Pull the remaining project fields (§5.3) |
| 8 | Write / refresh | New project → create as live (publish date = today, launch status = RERA; zone and micromarket derived from our logic). Existing → refresh Restack fields only (§3.6). |
| 9 | Resale check | For projects already in our DB: if a live or draft project's max possession < today → move to resale. Same daily job. |

### 5.1 QC — mandatory fields
If any are missing → do not ingest.

| Field | Note |
|---|---|
| Name | — |
| Builder Name | — |
| Location (Lat, Long) | Zone + micromarket derived from this |
| Phase Details | Phase Name, RERA ID, Handover Date, Approval Date (§4.1) |
| Area | In acres |
| Layout | Per §5.2 |
| No. of Units | — |
| Restack Project ID | The match key (§3.6) |
Note: Approval Date ≠ Launch Date — don't confuse the two.

### 5.2 Layout
Accept only: Apartment, Villa, Plot, Villament, Row House, Commercial, Offices. Drop anything else. Do not read layout from Restack's "asset type" field — it stores values like "mixed" there and is unreliable. Work the layout out properly into the list above.

### 5.3 Additional fields fetched (not QC-gated)
| Field | Note |
|---|---|
| Builder Logo | — |
| Pricing | — |
| Building Floor | — |
| Config | Exact values: 2, 2.5, 3, 3.5… A .5 means a studio variant. 🔲 confirm with Restack how they store it |
| Cover / Notif image | §3.4 |
| Master Plan | §3.4 (highest quality) |
| Brochure | PDF |

## 6. Image Handling & Load
Each image is saved once at original quality on our side and served through Cloudflare. Cropping and optimisation are applied at fetch time, not on the stored file — done by adjusting format, quality, and sizing on the fetch. Exact Cloudflare params are tech's call; this is the requirement.

| Image | Handling at fetch |
|---|---|
| Cover / Notif | Crop to a fixed ratio (no distortion): cover = 4:5, notification = 2:1. Quality ~95, best format per browser. |
| Master plan | Original quality, 100% size — no compression, no compromise. |
| Brochure | PDF — no compression. |
Load behaviour: show a skeleton while loading; lazy-load images below the fold.
On update: if Restack changes an image, the stored copy is re-pulled and replaced, and the previous image is deleted (§3.4).

## 7. CMS
https://docs.google.com/document/d/184lxi9dBlINqzGSsw1OEM0xACMlRix1aWuN0BuXCPcc/edit?tab=t.0

## 8. Project Page
Route /project
Sections configurable from CMS, same as Edge home — app + web.
Toggle (app + mWeb): switch between Home page and Project page.
Web: clicking "Edge" in the navbar opens a dropdown for Edge Home page and Project page.
Search bar on top. App / mWeb: tapping opens the search page with the keyboard up. Web (laptop): suggestions appear inline on the same page.

### 8.1 Card design (common to all cards)
| Element | Rule |
|---|---|
| Card image | Cover image (§3.4) |
| Top-left tag | Published < 24h → New. Else relative published date (3D ago, 4W ago) (§3.7) |
| Top-right tag | Launch status — Pre-launch / RERA (§3.2). Always visible |
| Builder name | Truncate to 1 line, … if longer |
| Builder logo | If missing → alternate per Figma (dev comment) |
| Project name | Per §3.3. Truncate to 2 lines |
| Location | Micromarket + Zone (East Bangalore → East). Truncate to 1 line |

Possession card = exception: no RERA tag, no New tag. Top-left shows relative possession instead (e.g. "Possession in 3 months").
If no cover image is available, use a default image.

### 8.2 Sections
Every section shows 10 cards + an 11th "more" card → opens the search page with that filter pre-applied. Sorted by published date. Each is configurable from CMS.

| # | Section | Contents | "More" → filter |
|---|---|---|---|
| 1 | Pre-launch | launchStatus = New Launch + Developer (§3.2) | Pre-launch + Developer → overall pre-launch |
| 2 | RERA Approved | All RERA projects | RERA |
| 3 | Search by Builder | Top 10 builders by project count, descending (live projects only) | Search page |
| 4 | Zones | See §8.3 | Selected zone |
| 5 | Asset Type | As-is | Asset filter |
| 6 | Possession | See §8.4 | Possession filter |

🔲 OPEN — Search by Builder ordering: confirm top 10 by project count (needs builder dedup §3.5 first, else counts split).

### 8.3 Zones section
Same logic as Edge home-page zones.
App: use the agent's own zone data.
mWeb / browser: use home-page logic (fetch as-is).
Order (fixed): North, East, South, West, Center.
Non-negotiable: the selected zone must always be visible on screen.

### 8.4 Possession section — all cases
Upcoming possession first. Multi-RERA → show once, at closest upcoming phase (§3.1).

| Case | Show |
|---|---|
| 1 project, 1 RERA | Normally |
| Multiple RERA, all future | Nearest possession date |
| Multiple RERA, some already passed | Next upcoming phase's date |

## 9. Search Page
Overall behaviour is the same as ACN one — take inspiration from there. Only the specifics below are new.
Search is recommendation-only: we suggest options and the user can only pick from those — no free-text / random-word search. Same behaviour as the ACN search.
Important (non-negotiable): every filter must live in the URL, so any filtered view can be shared as a link and the person who opens it sees the exact same set of projects.
On scroll, the search bar stays fixed at the top — on app, mWeb, and web.

## 10. Details Page
🔲 Changes only.
In the details page, add one RERA section (shows all phases from phase_details).
On the main page, remove approval date, completion date, and RERA ID from their previous place (now inside phase_details, §4.1).
Since the project schema is changing, reflect those changes here too so the page renders correctly. Applies to App, mWeb, Web.

## 11. Edge Home Page — Project Section Update
The existing Project section on the Edge home page needs its card UI updated to the new card (§8.1). Applies to App, mWeb, and Web.
Card UI → switch to the new project card design (§8.1).
Show 10 cards + an 11th "more" card.
"More" card → redirects to the Project page (/project).
