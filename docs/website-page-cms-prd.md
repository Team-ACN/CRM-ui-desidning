# PRD — Website Page in CMS (Top Banner)

**Status:** UI built (mock data), backend pending
**Owner:** _TBD_
**Last updated:** 2026-10-05

---

## 1. Summary

The CMS lets the team build page templates for agents, targeted by cohort. Alongside the Home and Properties pages of the app, it now supports the **Website page**: the ACN website home screen agents see in the browser.

Every Website template is built around a **Top Banner**, a full-width hero image at the top of the page behind the header and search box. The team uploads that image per template, so each cohort can see a different hero. A Website template cannot be saved without one.

## 2. Problem

- The website hero was fixed. There was no way to change it for a campaign, a season or a cohort without a code release.
- Nothing stopped a website template from going out with an empty or broken hero.
- The website preview in the CMS didn't match the real website: wrong navigation tabs, an old ticker strip and a placeholder blue hero. The team couldn't trust it as a preview.

## 3. Goals

- Let the CMS team set the website hero image per template, with no code change.
- Make the hero mandatory, so no Website template ships without one.
- Help the uploader get the image right first time, so key content isn't cropped on smaller screens.
- Make the website preview in the CMS look like the real website.

### Non-goals

- Changing the search box on the website (the existing search stays as it is).
- Rotating or multiple hero images. One image per template.
- Separate images for desktop and mobile. One image adapts to the screen.
- Editing hero text or buttons in the CMS. Any messaging is part of the uploaded image.

## 4. Users

| User | What they do |
| --- | --- |
| CMS / marketing team | Builds Website templates, uploads the hero, targets cohorts, submits for review |
| Reviewer (QC) | Reviews and approves templates before they go live |
| Agents | See the website hero chosen for their cohort |

## 5. What we built

### 5.1 Website page templates

- The CMS template list has a **Website Page** option next to Home Page and Properties Page.
- A Website template follows the same flow as the others: name, description, target cohorts, widgets, then save as draft or submit for review. Priority and go-live are managed in **Manage Priority**.

### 5.2 Top Banner is always there

- Every new Website template opens with the Top Banner already in place at the top of the page.
- Existing Website templates get the Top Banner added when they are opened for editing.
- The Top Banner can't be removed, moved or added twice. It always sits at the top as the page hero.
- It doesn't appear in the widget library, because it's already on every Website template.
- Other widgets are added below it as usual.

### 5.3 Top Banner is mandatory

- The builder shows a checklist at the top: **Name, Cohorts, Widgets, Top Banner**.
- "Top Banner" is ticked only once a hero image has been uploaded.
- **Save draft** and **Submit for review** stay disabled until every item is ticked.
- "Widgets" still needs at least one widget besides the Top Banner.

### 5.4 Uploading the hero

Clicking the hero on the page opens its settings on the right:

- **Guidance:** the recommended size, the allowed file types and the "safe area" where text and logos should sit so they aren't cropped.
- **Preview:** the uploaded image with the safe area outlined, and a Desktop / Tablet switch showing how the image crops on smaller screens.
- **Upload, replace or remove** the image.
- **Gentle checks:** if the image is the wrong shape, too small, too heavy or an unusual file type, a warning explains what will happen (for example "it will be cropped"). The upload is still allowed; the warning is advice, not a block. A correct image is confirmed with "matches spec".
- **Click-through link** (optional): where the hero takes agents when clicked.
- **Alt text:** a short description of the image for accessibility.

### 5.5 Website preview matches the real site

- **Header** updated to the real website: ACN logo; My Business, Properties, Services and Edge tabs; Add Property button; coins balance; notifications; profile.
- **Hero** shows the uploaded Top Banner behind the header, with the search box over its bottom edge. Before an image is uploaded, a placeholder asks for one.
- **Removed** from the preview: the old ticker strip ("2BHK in Sobha Dream Acres…"), the blue placeholder hero and its "Search best inventories…" headline.

### 5.6 Template list

- The on/off switch was removed from each template row. A row shows its priority, name, cohort, widget count, agent count and status (Live / Not Live), with View and Edit.
- Templates go live from **Manage Priority** ("Preview to Activate").

## 6. Current implementation state

| Area | State |
| --- | --- |
| Website templates, Top Banner widget, mandatory check | Built (prototype) |
| Hero upload, guidance, preview, warnings | Built (prototype) |
| Website preview header and hero | Built (prototype) |
| Image storage | Prototype keeps the image in the browser; real upload and storage needed |
| Saving templates | Mock data only; no backend yet |
| Showing the hero on the live website | Not built; needs the website to read the template's hero |

## 7. Open questions

1. **Widget limit:** templates allow 5 widgets. The Top Banner uses one, leaving 4 for Website templates. Should it be left out of the limit?
2. **Image hosting:** where are hero images stored, and is there a size or format limit on the backend?
3. **Phone view:** the preview covers desktop and tablet. Is a phone-width preview needed?
4. **Click-through rules:** should the link be restricted to ACN pages, or allow external links?
5. **Default hero:** what should agents see if no Website template targets their cohort?
