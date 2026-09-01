# Location Manager prototype — current project

**This file in the repo root is the only project handoff.** There is no second copy. GitHub Pages and GitHub both serve whatever is on **`main`**. If this file and the live site disagree, `main` is stale — do not invent a parallel markdown file.

Folder: `/Users/josephine/Downloads/dorothy-test`  
GitHub: `https://github.com/josephinebale/dorothy-test`  
Live: `https://josephinebale.github.io/dorothy-test/`  
Stack: React 19 + TypeScript + Vite 6 + Tailwind 4. Runtime extras: `lucide-react` only.

This is a research prototype of Hireup for Providers, for a manager who runs **one SIL location at a time**. It should feel like the existing product, not a redesign. Do not invent new visual language, new tokens, or new dependencies.

Say **location**, not house, in user-facing copy and in code that new work touches. Legacy `/manage-house` URLs still rewrite to `/manage-location`.

## Run it

- Dev: `npm run dev` → http://localhost:3020/ (hash routes, e.g. `#/bookings`). Vite is pinned to **3020**. If that port is busy, extra servers slide onto 3021, 3022, … and look like “nothing changed”. Keep **one** preview.
- Typecheck: `npm run lint` (`tsc --noEmit`).
- Tests: `node --test tests/*.test.ts` (there is no `npm test` script). Tests are mostly **source-file assertions**, not DOM tests. Removing a label or section will break them — update the assertion, do not delete it.

`README.md` is a short how-to-run note. **This file is the source of truth** for agents.

## Branch and deploy

Work on a `josephine-*` branch. Do **not** commit to `main` as the working branch. Do **not** force-push.

GitHub Pages deploys from **`main`** via `.github/workflows/deploy.yml`. `vite.config.ts` uses `base: './'` so the build works on a sub-path.

To ship: commit on the `josephine-*` branch, merge into `main`, push `main`. Until that merge, local work is invisible on the live URL.

## What it is for

A location manager (signed-in name **Helen Dawson**) at **Cerebral Palsy Alliance**, looking after one SIL house’s bookings, team, and messages. Organisation-level fields are read-only (`CAN_EDIT_ORGANISATION_DETAILS = false`).

There are three scopes: the **location** (switchable, in the header), the **organisation** (one per manager, not switchable), and **Helen**.

The test used when trimming settings: **is there a surface anywhere in this product where this content is consumed?** If nothing renders it, it goes. Consumer-product leftovers (bios, profile visibility, marketplace matching fields, location photos that never display) have been removed. Two location sections are **kept on purpose for research** — see Settings below.

## Session and first run

Persisted in `localStorage`:

- `hm.signedIn`
- `hm.lastLocationId` (legacy house key still read)
- `hm.sessionQuestions` (research overlay)

No location remembered → **Choose your location**. After that, return visits open the last location. Account menu: **Log out**, then **Log back in** or **Log in as a new user** (clears remembered location).

The **question-mark** control opens Session questions (quick notes tagged by page, general discussion questions grouped by page, other notes, copy-all). Small neutral `PinnedQuestion` dots beside selected elements open element-specific questions and answer fields. Both flavours save into `hm.sessionQuestions`, keyed by question ID, so copy-all includes them together.

`src/data/discussionQuestions.ts` is the source of truth for question wording and metadata. `elementHint` is a human-readable placement description, never a selector. Markers are placed manually in page JSX and are always visible in this research prototype.

## Routing

Custom hash router (`src/lib/router.ts`): `href`, `navigate`, `useHashRoute`, `canonicalPath`.

| Path | Page |
| --- | --- |
| `/` | Dashboard |
| `/bookings` | Bookings list (status rail) |
| `/request-booking` | Three-step request flow |
| `/bookings/request/:id` | Requested booking detail |
| `/team` | Team |
| `/messages` | Messages |
| `/notifications` | Notifications |
| `/manage-location…` | Location settings |
| `/organisation-settings…` | Organisation settings |
| `/your-account…` | Helen’s account |
| stubs | Report incident, help, legal, etc. (`src/pages/Stub.tsx`) |

**Bookings** stays the active header tab on `/request-booking` and `/bookings/request/…`.

Unknown or removed settings section IDs still resolve to that scope’s first remaining section (`sectionFromPath` in `src/lib/informationArchitecture.ts`). House aliases rewrite in `canonicalPath`.

## Placeholder data

`src/data/locations.ts`. Five public CPA SIL listing names, A–Z: Dee Why 1, Galston 1, Hornsby, North Ryde 1, Wahroonga. Suburbs only — no private street addresses.

Each location:

- **10–18** regular workers from a shared name pool
- Bookings seeded relative to **today** (stable between reloads, week view always includes today)
- Pattern is **24/7 SIL**: overlapping daytime shifts plus an overnight sleepover
- A worker is **not booked twice on the same day**
- Status mix: `confirmed` | `requested` | `ended`

Avatars: photo files in `src/assets/avatars/`, keyed in `src/data/avatars.ts`. Helen uses `helen-dawson.jpg`. Square = place (`LocationMarker`). Circle = person (`Avatar`).

Created booking requests are **session-only** (`createdBookings` in `App.tsx`). They prepend onto the current location’s list and bump `requestsToAccept`. Refresh loses them.

## Booking request flow

Entry: **Request booking** (`PageHeading`) → `#/request-booking`.

1. **Location, date and time** — a location **dropdown** of the five SIL locations, already set to the location in the header. Changing it updates the header and the worker list. Continue needs a date and an end time after start. Frequency: one-off / weekly / fortnightly.
2. **Details** — support description, “I’ll share all relevant support plans…”, driving radios, optional finance reference.
3. **Select workers** — up to **10** people from **that location’s team** (`data.workers`). One row is shown as “Booked at this time” (disabled). Empty team has its own copy.

`<BookingRequest key={visibleData.location.id} />` so switching location in the header **resets the draft**.

Submit writes a `requested` booking and goes to `#/bookings/request/{id}`. Detail: status stepper, workers, pricing estimate (`$72.74` / hour, same as list cards).

**Requested** list cards use `href(/bookings/request/${booking.id})`. Confirmed cards still stay on `/bookings`.

Dashboard week grid collapses to **4 bookings per day** with show more / Show less (`COLLAPSED_BOOKINGS_PER_DAY`).

## Header and footer (settled)

Two tiers, `max-w-page` + `px-8` on both.

**Tier 1** (48px, `--header-identity-height`): Hireup lockup (24px, `block h-6 w-auto`) · Messages + Notifications (label + badge, no decorative icons, 36px default buttons) · account (Helen, **md 36px** photo, `size="default"`, class `-mr-4`). No divider before the account. All three controls are centred with 6px above and below; the account wrapper must stay `flex` to avoid an inline baseline gap.

**Tier 2** (56px, `--header-nav-height`): LocationSwitcher (`-ml-2` on the trigger so the marker lines up with the logo) · 24px hairline (`h-6 w-px self-center`) · Dashboard / Bookings / Team. Active link: `font-medium`, brand underline on the **row bottom**. Links are `h-full`. Header bottom hairline is `box-shadow: 0 1px 0` on `.app-header` — it sits **under** the 2px active underline, not on top of it.

**Footer:** compact logo **18px** (`block w-auto`), row `flex items-center`, `py-3`, `--footer-gap`.

### Alignment traps (do not “fix” with extra padding)

- `.ui-button--default` is **unlayered CSS**: `height: 2.25rem; padding: 0 var(--space-4)` (16px). Tailwind `px-2` on the account button **does not win**. The right-edge pull-back is `-mr-4` (16px), not `-mr-2`.
- `.ui-button` already `inline-flex` + `align-items: center` + `gap: var(--space-2)`.
- `.location-switcher-trigger` already `align-items: center`. Internal padding stays; only `-ml-2` pulls the face to the logo.
- Badge: 18px height, `min-width: 1.125rem`, 4px horizontal padding, `leading-none` / flex centre. Colour `#D6244A`. Sits **beside the label**.
- A button uses an icon or a text label, not both. Identity (Helen’s avatar and the location marker) and menu chevrons are not decorative and stay. Icon-only controls keep accessible labels. Remaining icons stay `h-5 w-5` (`tests/icon-size.test.ts`).
- Location marker: `h-9 w-9 rounded-lg`, no border/ring, one green for every location (`#E6F2E8` / `#216B2D`).

## Visual consistency rules

- Standard page shell: 32px top padding and 24px between `PageHeading` and the first content block. Do not remove page headings, including Dashboard.
- Colour signals status or interactivity. On the Dashboard week grid, only `requested` cards are tinted because they need a decision; `confirmed` and `ended` cards stay white with quiet status pills.
- Booking prices use neutral tags, not success green.
- Rail navigation on Bookings and all Settings scopes uses the same active treatment: 2px brand left marker, `px-3 py-2`, and quiet selected background.
- Dividers stay only where they separate adjacent content that would otherwise read as one group. The line above Bookings filters is intentionally absent; the rail’s 16px gap separates navigation from filters.

## Layout archetypes

- Page shell: 1440px (`--container-page: 90rem`), main `px-8 pt-8 pb-4`.
- Narrow column: `--narrow-column-width: 20rem` (320px). Do not invent per-page sidebar widths.
- Bookings + Settings: `layout-rail-content`.
- Messages: `layout-master-detail`.
- Dashboard: `layout-content-aside`.
- Team / stubs: `width-main-column`.

## Design tokens (`src/index.css`)

Do not add tokens. Prefer primitives in `src/components/ui/`.

**Spacing trap:** named `--space-1`…`--space-8` = 4, 8, 12, 16, 24, 32, 40, 48px. Tailwind numbered utilities multiply `--spacing` (4px): `gap-6` = **24px**, `px-8` = **32px**. Do not equate `*-6` with `--space-6`.

| Token | Value |
| --- | --- |
| Brand | `#1424E0` (hover `#0F1CB8`) |
| Badge | `#D6244A` |
| Page | `#eff1f5` |
| Radii | control 4px, surface 8px |
| Avatars | sm 28, md 36, lg 44 |
| Type | xs 12/16, sm 14/20, md 16/24, lg 20/28, xl 24/32. Weights 400 / 500 / 700 |

Primitives: `Button`, `IconButton`, `Card` (incl. `tone="subtle"`), `Badge`, `Tag`, `EntityLink`, `Avatar`.

Type hierarchy already tightened: card / empty titles `text-sm font-bold`; page title `text-xl font-bold`.

## Menus

Defined in `src/lib/informationArchitecture.ts` plus the two header menus.

**Location menu** (`LocationSwitcher`): organisation name is a plain, non-interactive label at the top. Then the five locations (do not restructure this list — switching location is the core interaction). Then a divider and two rows: **Location settings** (`/manage-location`) and **Organisation settings** (`/organisation-settings`). Do not call the first row “Manage this location” or “Manage locations”.

**Account menu** (`AppHeader`): four rows only — **Helen Dawson** (plain heading, not a link), **Your account** (`/your-account`), a separator, **Log out**. Account page sections are not duplicated as extra menu rows. No row icons.

## Settings (three scopes)

Still three destinations with a **left rail** per scope (not one dumped settings page). Routes and surviving section IDs are unchanged.

**Location settings** (`/manage-location`, heading “Location settings”):

- Support worker preferences
- Support plan — **kept for research**. A house-level plan is likely leftover from one-client matching; ask the participant whether a SIL house has one plan or many.
- Location name — **kept for research**. Names are public CPA SIL listing names; ask whether a house manager would rename them.
- People (load-bearing for roles and access)

Removed from this scope: location picture (the marker is initials, no photo renders), support areas, specialised support, COVID-19.

**Organisation settings** (`/organisation-settings`): organisation details, financial details, documents, people. Whole scope is **read-only**. Financial and documents are still present (thin placeholder content).

**Your account** (`/your-account`): a **single Account section** with email, profile photo upload (Helen’s photo *does* render in the header and threads), and one password field. Removed: About you (no one reads a manager bio here), Privacy (no profile visibility to govern). Old paths such as `/your-account/privacy` still open the Account section.

## Files that matter

| Area | Path |
| --- | --- |
| Routes / created bookings | `src/App.tsx` |
| Request flow | `src/pages/BookingRequest.tsx` |
| Bookings list | `src/pages/Bookings.tsx` |
| Header / account menu | `src/components/AppHeader.tsx` |
| Location switcher / marker | `src/components/LocationSwitcher.tsx`, `LocationMarker.tsx` |
| Settings scopes | `src/pages/Settings.tsx`, `src/lib/informationArchitecture.ts` |
| Data | `src/data/locations.ts` |
| Discussion guide | `src/data/discussionQuestions.ts`, `src/components/PinnedQuestion.tsx` |
| Tokens | `src/index.css` |
| Flow tests | `tests/booking-request-flow.test.ts` |
| Header tests | `tests/header-polish.test.ts` |
| Page polish tests | `tests/icon-or-label.test.ts`, `tests/status-colour.test.ts`, `tests/page-polish.test.ts` |
| IA / menus tests | `tests/information-architecture.test.ts` |
| Discussion guide tests | `tests/discussion-questions.test.ts`, `tests/discussion-guide-ui.test.ts`, `tests/session-questions.test.ts` |

## Not built

Jobs, invoices as a real product, multi-location aggregate views, booking request persistence across refresh, Edit / Cancel on the detail screen (buttons are present, not wired). Settings **content** is still mostly placeholder; structure is what matters for research.

## Agent habits

- Check `src/components/ui` and existing pages before new UI.
- Empty, error, and loading/absent states when UI depends on data.
- After UI work, verify in the browser at **http://localhost:3020/** signed in, inside a location (Choose your location has a stripped header).
- `npm run lint` and `node --test tests/*.test.ts` after behaviour changes.
- Do not commit unless asked. Do not force-push. Do not use `main` as a working branch.
- After shipping, update **this** `PROJECT.md` in the same merge to `main`. Do not leave an uncommitted local copy as the “real” spec.
