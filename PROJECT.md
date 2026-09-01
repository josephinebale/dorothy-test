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

- `hm.prototypeStarted`
- `hm.signedIn`
- `hm.lastLocationId` (legacy house key still read)
- `hm.sessionQuestions` (research overlay)
- `hm.locationProfiles` (worker-facing profile details for each location)

No prototype-start flag → **Log in to Hireup**, a simplified login screen: logo, tagline, and one **Login** button, with no credential fields. Logging in clears any remembered location and proceeds to **Choose your location**. After a location is chosen, return visits open the last location. Account menu: **Log out**, then **Log back in** or **Log in as a new user** (clears remembered location).

The eye control shows or hides all `PinnedQuestion` markers. Visibility defaults to off and persists in `hm.sessionQuestions` across reloads. Markers open a popover containing only the element-specific question text. There is no Session questions panel, notes list, or copy-all control.

Beside it, **Restart prototype** resets the run between participants: it clears `hm.prototypeStarted`, `hm.lastLocationId` (and the legacy house key), `hm.signedIn`, and `hm.locationProfiles`, drops in-memory bookings and the unread override, and returns to the **Log in to Hireup** screen. It deliberately keeps `hm.sessionQuestions`, since annotation visibility is the moderator’s preference, not the participant’s state. It asks for confirmation first, because it sits next to a control used mid-session.

A third control sits in the **bottom-left** corner, deliberately away from that pair, and only appears on pages listed in `src/lib/pageVariants.ts`. It swaps the page to a second version mid-session — currently only **Show more worker detail** on `/request-booking`, which turns step 3’s plain worker list into the richer one (suburb and distance, team, and the full training list). The state lives in `App.tsx`, so it survives moving between steps and resets on restart. It is a moderator control, not a participant one: nothing in the page hints at it.

`src/data/discussionQuestions.ts` is the source of truth for question wording and metadata: `{ id, page, type, text, elementHint? }`. It stores no answers. `elementHint` is a human-readable placement description, never a selector. Markers are placed manually in page JSX. The general `settings-co-design` activity is in the catalogue for the Location, Organisation, and Account settings areas.

## Routing

Custom hash router (`src/lib/router.ts`): `href`, `navigate`, `useHashRoute`, `canonicalPath`.

| Path | Page |
| --- | --- |
| `/` | Dashboard |
| `/bookings` | Bookings list (status rail), defaults to Confirmed |
| `/bookings/:status` | One rail status: `requested`, `confirmed`, `waiting`, `approve`, `next-invoice`, `invoiced` (`bookingsViewPath` / `bookingViewFromPath` in `pageContent.ts`) |
| `/request-booking` | Three-step request flow |
| `/bookings/request/:id` | Requested booking detail |
| `/team` | Team |
| `/team/:workerId` | Worker profile |
| `/location-profile-preview` | Preview of the selected location profile workers see |
| `/messages` | Messages |
| `/notifications` | Notifications |
| `/manage-location…` | Location settings |
| `/organisation-settings…` | Organisation settings |
| `/your-account…` | Helen’s account |
| stubs | Report incident, help, legal, etc. (`src/pages/Stub.tsx`) |

**Bookings** stays the active header tab on `/request-booking`, `/bookings/request/…`, and every `/bookings/:status`.

The rail writes the status into the address (`navigate(bookingsViewPath(id))`) rather than holding it in component state, so notifications can deep-link and the back button returns to the previous status. Requests-waiting notifications open `requested`; approvals notifications open `approve`. An unrecognised status falls through to the stub route, and `/bookings/request/:id` is matched first so it never reads as a status.

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

## Worker profiles

Clicking a worker name from Team, the Dashboard’s Most booked workers list, a booking card, a requested-booking detail, or the active message thread opens `#/team/{workerId}`. Names inside worker-selection controls and the conversation list keep their selection behaviour instead of navigating.

The profile adapts the existing Hireup worker profile into this prototype’s UI primitives: identity and verification summary, About, availability, support offered, verified documents, qualifications, and work history. Profile content is deterministic placeholder data derived from the worker’s location record.

Because Messages spans locations, a profile link can point at a worker outside the current one. `findWorker(workerId)` in `src/data/locations.ts` resolves an ID against every location, preferring the current one, and the heading, the card, and the booking count all name **that worker’s** location rather than the selected one. Only an ID that exists nowhere shows the not-found state.

## Messages is universal

Messages sits in the universal nav, so the list is every conversation with every worker across all five locations — not the selected location’s roster. `buildAllConversations()` interleaves locations by index before sorting newest first, so the top of the list mixes locations instead of showing one at a time. Each row names its location on a third quiet line (`text-xs text-text-tertiary`), the open thread names it under the worker, and search matches location names as well as worker names and previews.

The header message count is therefore the universal total (`totalUnreadMessages()`, 9), not `data.unreadMessages`. Switching location does not rebuild the list or reset what has been read. Notifications stay location-scoped: that page reports on the location you are in.

## Header and footer (settled)

Two tiers, `max-w-page` + `px-8` on both. The header is **not sticky** — it scrolls away with the page. The request-booking Summary still sticks, but to `top-8` (page padding), not to a 128px offset that used to clear a pinned header.

**Tier 1** (56px, `--header-identity-height`): Hireup lockup (24px, `block h-6 w-auto`) · 24px hairline · LocationSwitcher · Messages + Notifications (36px icon-only controls with contextual badges) · account (**md 36px** Helen photo + rotating chevron, no text label, class `-mr-4`). The extra row height gives every 36px control 10px above and below.

**Tier 2** (48px, `--header-nav-height`): Dashboard / Bookings / Team only. Links use 14/20 type (`text-sm`) with 24px gaps. Inactive links use dark `--color-text-strong` at 500, not a muted grey; active links use primary body text at 700 plus a 3px body-text underline on the **row bottom** (`.main-nav-link` carries a matching 3px `padding-top` so the label stays optically centred). Type stays 14px — definition comes from weight and the underline, not size. Links are `h-full`. The two row heights total 104px; the 1px separator sits between them. Header bottom hairline is `box-shadow: 0 1px 0` on `.app-header` — it sits **under** the active underline, not on top of it.

**Footer:** unchanged by the header refresh. Compact logo **18px** (`block w-auto`), row `flex items-center`, `py-3`, `--footer-gap`.

### Alignment traps (do not “fix” with extra padding)

- `.ui-button--default` is **unlayered CSS**: `height: 2.25rem; padding: 0 var(--space-4)` (16px). Header dropdown triggers also carry the later `.header-menu-trigger`, which intentionally gives both account and location controls 36px height and 8px horizontal padding. The account right-edge pull-back remains `-mr-4`.
- `.ui-button` already `inline-flex` + `align-items: center` + `gap: var(--space-2)`.
- An input placed beside a button must come down to the button’s 36px (`h-9`), not the other way round: button height is unlayered CSS, so a Tailwind height on the button is a silent no-op. Stacked form fields with labels stay 40px (`h-10`). Any row mixing controls also needs `items-center`, or the default stretch top-aligns them (this was the Messages search row: 40 / 36 / 28px, all top-aligned).
- `.header-menu-trigger` supplies the shared location/account height, radius, gap, transparent rest state, and subtle hover. Both use one ChevronDown which rotates while open.
- Badge: 18px height, `min-width: 1.125rem`, 6px horizontal padding (`calc(var(--space-1) * 1.5)`), `leading-none` / flex centre, and `tabular-nums`. Digits are already centred by the flex box — 4px padding made the pill look cramped rather than off-centre, so the fix was air, not alignment. Two digits render 27.5px wide, one digit 19.7px. Colour remains `#D6244A` (about 4.99:1 with white, so no token change was needed). Header utility badges are overlaid at the top-right with a 2px surface-coloured separation ring; the Bookings nav badge remains inline.
- A button uses an icon or a text label, not both. Identity (Helen’s avatar and the location marker) and menu chevrons are not decorative and stay. Icon-only controls keep accessible labels. Remaining icons stay `h-5 w-5` (`tests/icon-size.test.ts`).
- Location marker: `h-9 w-9 rounded-lg`, no border/ring, one green for every location (`#E6F2E8` / `#216B2D`).

## Visual consistency rules

- Standard page shell: 32px top padding and 24px between `PageHeading` and the first content block. Do not remove page headings, including Dashboard.
- One heading block per page, like Team: title, description, and the page action inline in the same row. On Bookings that heading is the selected view (`activeLabel` — Confirmed, Requested, and so on) with its “Showing 1 – 40 of 129 …” count as the description and **Request booking** on the right. The view name is not repeated as a second heading below.
- Colour signals status or interactivity. On the Dashboard week grid, only `requested` cards are tinted because they need a decision; `confirmed` and `ended` cards stay white with quiet status pills.
- Booking prices use neutral tags, not success green.
- List rows keep one line: avatar, name, then row actions right-aligned and centred against the avatar. The Dashboard’s Most booked workers rows use 36px icon-only `IconButton`s (`MessageSquare` for Message, `Calendar` for Book) with `aria-label` and a matching tooltip, so a narrow column does not push actions onto a second line.
- Rail navigation on Bookings and all Settings scopes uses the same active treatment: 2px brand left marker, `px-3 py-2`, and quiet selected background.
- Dividers stay only where they separate adjacent content that would otherwise read as one group. The line above Bookings filters is intentionally absent; the rail’s 16px gap separates navigation from filters.

## Layout archetypes

- Page shell: 1440px (`--container-page: 90rem`), main `px-8 pt-8 pb-4`.
- Narrow column: `--narrow-column-width: 20rem` (320px). Do not invent per-page sidebar widths.
- Bookings + Settings: `layout-rail-content`.
- Messages: `layout-master-detail`. The shell is a **definite** `height: var(--messages-shell-height)` with `grid-template-rows: minmax(0, 1fr)`, and both columns carry `min-h-0`. All three are needed: with only a height the grid row still stretches to its content, and without `min-h-0` a column refuses to shrink, so the list grows instead of scrolling. Conversation rows carry the divider on the `li` with `last:border-b-0`, so the list finishes on one line rather than doubling up against the next element.
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

- Location profile — editable worker-facing About, support locations, broad support needs, safety information, and support required; includes **Preview profile**
- Support worker preferences
- Support plan — **kept for research**. A house-level plan is likely leftover from one-client matching; ask the participant whether a SIL house has one plan or many.
- Location name — **kept for research**. Names are public CPA SIL listing names; ask whether a house manager would rename them.
- People (load-bearing for roles and access)

Removed from this scope: location picture (the marker is initials, no photo renders), support areas, specialised support, COVID-19.

Location profile edits persist per location in `hm.locationProfiles`. The preview deliberately uses broad location-level information only: never add resident names, diagnoses tied to individuals, private addresses, or booking-specific support-plan details.

**Organisation settings** (`/organisation-settings`): organisation details, financial details, documents, people. Whole scope is **read-only**. Financial and documents are still present (thin placeholder content).

**Your account** (`/your-account`): a **single Account section** with email, profile photo upload (Helen’s photo *does* render in the header and threads), and one password field. Removed: About you (no one reads a manager bio here), Privacy (no profile visibility to govern). Old paths such as `/your-account/privacy` still open the Account section.

## Files that matter

| Area | Path |
| --- | --- |
| Routes / created bookings | `src/App.tsx` |
| Request flow | `src/pages/BookingRequest.tsx` |
| Bookings list | `src/pages/Bookings.tsx` |
| Worker profile | `src/pages/WorkerProfile.tsx`, `src/lib/pageContent.ts` |
| Header / account menu | `src/components/AppHeader.tsx` |
| Location switcher / marker | `src/components/LocationSwitcher.tsx`, `LocationMarker.tsx` |
| Settings scopes | `src/pages/Settings.tsx`, `src/lib/informationArchitecture.ts` |
| Location profile edit / preview | `src/components/LocationProfileSettings.tsx`, `src/pages/LocationProfilePreview.tsx`, `src/lib/locationProfiles.ts` |
| Data | `src/data/locations.ts` |
| Discussion guide | `src/data/discussionQuestions.ts`, `src/components/PinnedQuestion.tsx` |
| Research dock (annotations, restart) | `src/components/SessionQuestions.tsx`, `src/lib/session.ts` |
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
