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
| `/bookings/detail/:id` | Detail for any calendar booking |
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
- Pattern is **24/7 SIL**: daytime shifts plus an overnight sleepover
- Volume is deliberately **light for research sessions**: a day is **2–4 bookings** (one to three day shifts plus the overnight) and a week 16–24, against 35 for a full roster. Every day fits inside `COLLAPSED_BOOKINGS_PER_DAY`, so nothing hides behind the expander and the sleepover shows without expanding.
- Day staffing **varies day to day** (`daytimeCountFor`) around each location's `DAYTIME_COUNTS` base, weighted towards the base and above. Uniform columns made the week grid read as a wall. Raise `DAYTIME_COUNTS` to go back to a dense roster.
- A worker is **not booked twice on the same day**
- Status mix: `confirmed` | `requested` | `ended`. At most **three requested bookings per week per location** (`assignRequested`), on different days, so the week grid shows a few decisions waiting without filling every column.

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

Dashboard week grid collapses to **4 bookings per day** with show more / Show less (`COLLAPSED_BOOKINGS_PER_DAY`). At current seeded volume no day reaches that cap, so the expander stays hidden; it still covers denser weeks and session-created requests. Every shift card is a whole-card link to `/bookings/detail/:id`; the detail adapts the existing requested-booking layout for requested, confirmed, and completed bookings. The neutral detail route keeps confirmed and ended shifts from being described as requests. Newly submitted requests still open their established `/bookings/request/:id` route.

## Worker profiles

Clicking a worker name from Team, the Dashboard’s Most booked workers list, a booking card, a requested-booking detail, or the active message thread opens `#/team/{workerId}`. Names inside worker-selection controls and the conversation list keep their selection behaviour instead of navigating.

The profile adapts the existing Hireup worker profile into this prototype’s UI primitives: identity and verification summary, About, availability, support offered, verified documents, qualifications, and work history. Profile content is deterministic placeholder data derived from the worker’s location record.

Because Messages spans locations, a profile link can point at a worker outside the current one. `findWorker(workerId)` in `src/data/locations.ts` resolves an ID against every location, preferring the current one, and the heading, the card, and the booking count all name **that worker’s** location rather than the selected one. Only an ID that exists nowhere shows the not-found state.

## Messages is universal

Messages sits in the universal nav, so the list is every conversation with every worker across all five locations — not the selected location’s roster. `buildAllConversations()` interleaves locations by index before sorting newest first, so the top of the list mixes locations instead of showing one at a time. Each row names its location on a third quiet line (`text-xs text-text-tertiary`), the open thread names it under the worker, and search matches location names as well as worker names and previews.

The header message count is therefore the universal total (`totalUnreadMessages()`, 9), not `data.unreadMessages`. Switching location does not rebuild the list or reset what has been read. Notifications stay location-scoped: that page reports on the location you are in.

## Header and footer (settled)

Two tiers, `max-w-page` + `px-8` on both. The header is **not sticky** — it scrolls away with the page. The request-booking Summary still sticks, but to `top-8` (page padding), not to a 128px offset that used to clear a pinned header.

**Tier 1** (56px, `--header-identity-height`): Hireup lockup (24px, `block h-6 w-auto`) · LocationSwitcher · Messages + Notifications (36px icon-only controls with contextual badges) · account (**md 36px** Helen photo + rotating chevron, no text label, class `-mr-4`). The extra row height gives every 36px control 10px above and below.

**Tier 2** (48px, `--header-nav-height`): Dashboard / Bookings / Team only. Links use 14/20 type (`text-sm`) with 24px gaps. Inactive links use dark `--color-text-strong` at 500, not a muted grey; active links use primary body text at 700 plus a 3px body-text underline on the **row bottom** (`.main-nav-link` carries a matching 3px `padding-top` so the label stays optically centred). Type stays 14px — definition comes from weight and the underline, not size. Links are `h-full`. The two row heights total 104px; the 1px separator sits between them. Header bottom hairline is `box-shadow: 0 1px 0` on `.app-header` — it sits **under** the active underline, not on top of it.

**Footer:** unchanged by the header refresh. Compact logo **18px** (`block w-auto`), row `flex items-center`, `py-3`, `--footer-gap`.

### Alignment traps (do not “fix” with extra padding)

- `.ui-button--default` is **unlayered CSS**: `height: 2.25rem; padding: 0 var(--space-4)` (16px). Header dropdown triggers also carry the later `.header-menu-trigger`, which intentionally gives both account and location controls 36px height and 8px horizontal padding.
- `.ui-button` already `inline-flex` + `align-items: center` + `gap: var(--space-2)`.
- An input placed beside a button must come down to the button’s 36px (`h-9`), not the other way round: button height is unlayered CSS, so a Tailwind height on the button is a silent no-op. Stacked form fields with labels stay 40px (`h-10`). Any row mixing controls also needs `items-center`, or the default stretch top-aligns them (this was the Messages search row: 40 / 36 / 28px, all top-aligned).
- `.header-menu-trigger` supplies the shared location/account height, radius, 12px gap (`--space-3`, same as list rows next to an avatar), and subtle hover. Both use one ChevronDown which rotates while open. **Both are contained**, with the same 1px `--color-border` and white fill as the icon buttons beside them, so every control in the row is bounded. That forces their contents down a step: a 36px trigger leaves a 34px content box, and the avatar and location marker were themselves 36px, so the border cut straight through them. Both drop to **28px** — the account uses `Avatar size="sm"` and the trigger uses `LocationMarker size="sm"`. The marker keeps 36px everywhere else (`size="md"`, the default), because in list rows it stands beside a 36px avatar. There is no way to contain these without shrinking the contents; growing the triggers to 44px was the alternative and it unbalances them against the 36px icon buttons.
- Neither trigger has a pull-back any more, and **do not reintroduce one**. `margin-inline-start` on the location switcher and `-mr-4` on the account trigger existed only because the triggers' 8px insets were invisible, so the marker and avatar had to be dragged out to line up with the logo and the page edge. Now the bordered box is the visible edge and aligns on those itself: measured, the logo and nav both start at 32px, the logo and the switcher sit 24px apart, and the account box ends 32px from the right edge. Keeping the pulls would overhang the page padding. The logo and location switcher sit in a `gap-6` (24px) cluster — the same step as the nav links. The 24px hairline that used to sit between them is **gone, and should not come back**: it was there to separate the logo from a borderless trigger, and once the trigger became a bordered box the line and the border were two separators doing one job. A boxed control is already visibly its own object, so the rule is that a divider earns its place only next to something unbounded. The outer identity row stays `gap-4` between this cluster and the utilities.
- Badge: 18px height, `min-width: 1.125rem`, 6px horizontal padding (`calc(var(--space-1) * 1.5)`), `leading-none` / flex centre, and `tabular-nums`. Digits are already centred by the flex box — 4px padding made the pill look cramped rather than off-centre, so the fix was air, not alignment. Two digits render 27.5px wide, one digit 19.7px. Colour remains `#D6244A` (about 4.99:1 with white, so no token change was needed). Header utility badges are overlaid at the top-right with a 2px surface-coloured separation ring; the Bookings nav badge remains inline.
- A button uses an icon or a text label, not both. Identity (Helen’s avatar and the location marker) and menu chevrons are not decorative and stay. Icon-only controls keep accessible labels. Icons stay `h-5 w-5` (20px), with one sanctioned exception: a glyph inside the 32px `size="small"` IconButton drops to `h-4 w-4` (16px). That is a **pairing, not a second free size** — 20px in the 36px control and 16px in the 32px one both leave exactly 8px on each side, so the two controls look equally inset rather than the small one looking tighter. `tests/icon-size.test.ts` enforces it by checking each 16px glyph really does sit inside a small IconButton, so the size cannot leak out to loose icons.
- Repeated actions in a dense list use the 32px control: the Dashboard's Most booked workers Message and Book buttons take the same `size="small"` as the week arrows, 8px apart. Standalone controls that are not in a list — the header utilities, the research dock, the row overflow menus on Team and Settings — stay at 36px.
- Location marker: `h-9 w-9 rounded-lg`, no border/ring, one green for every location (`#E6F2E8` / `#216B2D`).

## Visual consistency rules

- Standard page shell: 32px top padding and 24px between `PageHeading` and the first content block. Do not remove page headings, including Dashboard. Dashboard’s heading action is **Request booking** only; **Report incident** stays on booking cards, not the Dashboard.
- Container insets come from one three-step scale, picked by density rather than a single number everywhere. `.ui-inset-compact` (8px) is for dense data cells — the Dashboard week grid and the booking chips inside it, where seven columns share one row. `.ui-inset-row` (12px vertical, 16px horizontal) is for list rows — Team, Most booked workers, Messages, Notifications, Settings people, Choose location, and the nested worker card on a booking. The horizontal 16px matches the card step, so row content and card content share one left edge. `.ui-inset-card` (16px) is for cards holding prose or several blocks. Larger standalone settings sections keep their 24px inset.
- One heading block per page, like Team: title, description, and the page action inline in the same row. Bookings keeps **Bookings** as its title with **Request booking** on the right; the selected view (`activeLabel` — Confirmed, Requested, and so on) and its “Showing 1 – 40 of N …” count head the results column instead, next to the rail that changes them. Folding the view name into the page heading was tried and reverted.
- Colour signals status or interactivity. On the Dashboard week grid, only `requested` cards are tinted because they need a decision; `confirmed` and `ended` cards stay white with quiet status pills.
- Whole-surface links use the same flat interaction treatment: `ui-target-row` for stretched-link rows and `ui-linked-surface` for a link wrapping a card. Both transition only background and border colour over 150ms, use `surface-subtle` on hover and `surface-selected` while pressed, and keep the blue focus outline. Requested cards mix the existing pending surface and pending colour so their decision signal does not disappear on hover. Do not add chevrons, movement, or shadows — those crowd the seven-column grid or make a data tile look like a floating overlay.
- **A clickable thing says so at rest, and how it says so depends on whether it has text of its own.** An entity name that navigates takes the link treatment through `a.ui-entity-link` — brand blue, underlined. It is keyed to the *element*, not an opt-in class, so a name that opens a profile cannot ship looking like dead text; that is exactly how the Team list read for months while the dashboard worker list beside it was blue. Rendered `as="span"` (Settings people, Choose location) it is a label and keeps the plain strong-text treatment. The Messages conversation list opts out with `a.ui-entity-link--plain`, because its name selects a conversation in the pane beside it rather than navigating and the row already carries a selected state; the opt-out matches the base rule's specificity, so it must stay **after** it in the file.
- Week-grid cards get no text cue at all. The card is one link to the booking and the worker name inside it is not separately clickable, so styling that name as a link would promise a profile and deliver a booking. The tile carries the affordance instead: `.ui-linked-surface > .ui-card--default` takes a full-strength `--color-border` at rest rather than the `--color-border-subtle` a static card uses. Hover then moves only the fill, matching how a pending card in the same grid already behaves — there is no `gray-400`, so a darker hover border would have to jump to `gray-500` and read as heavy.
- **One hover for every text link: lose the rest-state underline and deepen to `--color-brand-hover`.** All three treatments resolve to it — `.ui-link` (the standard link), `a.ui-entity-link` (a name that opens a profile), and `.ui-target-row__link--text` (a row's own link) — so hovering a link never depends on which screen it is on. Use `.ui-link` rather than hand-rolling `text-brand underline hover:text-brand-hover`; that pattern was written out longhand in seven places and six of them silently missed the hover. `.ui-link--flush` is the one variant: the week grid's expand control spans the card and sits on its bottom edge, so its focus ring is inset `-2px` instead of outset. It must stay **after** the shared `:focus-visible` rule to win. The footer follows it too, through `.ui-link--muted`: those links stay secondary grey rather than brand blue, but they now carry the underline at rest and lose it on hover like everything else. They previously did the exact inverse — no underline until hover — which meant hovering meant two opposite things depending on where you were on the page. The variant sets colour only, so it must stay **after** `.ui-link` to win.
- A link **nested** inside an interactive surface — currently just the worker link on a Bookings card, which opens a profile while the card opens the booking — carries `.ui-nested-link` and answers on its own. While the pointer is on it the row holds its rest state, so two destinations are never lit at once, and the link drops the underline it carries at rest and deepens to `--color-brand-hover`. Losing an underline is a change only the link can make, so it cannot be misread as the surface behind it highlighting. This is deliberately **not** applied to a link that *is* its row's own link (Team, Notifications, the dashboard worker list): those share the row's destination and should highlight together. The suppression is written as `:not(:has(.ui-nested-link:hover))` on the row's hover and active rules rather than a background override, so it does not have to guess the row's rest colour; `.ui-target-row--active` is excluded by name rather than out-specified, so a selected row keeps its blue through hover.
- Booking prices use neutral tags, not success green.
- List rows keep one line: avatar, name, then row actions right-aligned and centred against the avatar. The Dashboard’s Most booked workers rows use 36px icon-only `IconButton`s (`MessageSquare` for Message, `Calendar` for Book) with `aria-label` and a matching tooltip, so a narrow column does not push actions onto a second line.
- **Every icon-only button carries an outline at rest.** `.ui-icon-button` itself sets the 1px `--color-border` and white `--color-surface`, so the outline is the base rather than an opt-in prop — a new icon button cannot ship bare by leaving something off. Emphasis-per-setting was tried and abandoned: outlining only standalone controls (week arrows, research dock) while dense row actions took a grey `--subtle` fill and header utilities took no chrome at all left three resting states on one screen, and the grey fill read as a tag or a location marker rather than a control. Adjacent actions sit 8px apart. Because the class is unlayered CSS its background beats any Tailwind `bg-*` utility, so the header's selected state needs the plain `.header-utility--active` class; a utility there paints nothing. Decorative icons — the glyphs on notification summaries — stay bare `lucide` glyphs, and that contrast is now the whole tell. Controls that already pair an icon with a label or an avatar (the location switcher, the account trigger) are exempt; their text carries the affordance.
- Tooltips sit **under** their trigger, centred, everywhere. The two docked corner controls are the only exception: they flip above and anchor to their inner edge, because a centred tooltip on a corner button overhangs the viewport even while hidden and gives the page a horizontal scrollbar. `.ui-card--divided` is `overflow: visible` and rounds its own first and last rows instead (`calc(var(--radius-lg) - 1px)`, inset by the border), so a row action's tooltip can hang below the card. Do not put `overflow: hidden` back on it — that clips the tooltip, and the old workaround of flipping it to the side of the button reads as misplaced. Raising the tooltip's own `z-index` does not lift it out of its row: `.ui-target-row__action` needs `z-index: 2` to clear the stretched link, and that makes each row's actions a stacking context, so the tooltip is trapped inside it and the next row's actions paint straight over it. `.ui-target-row__action:hover, :focus-within` lifts the row being pointed at to `z-index: 3` instead. This only became visible once icon buttons gained a background — while they were transparent there was nothing to cover it.
- Rail navigation on Bookings and all Settings scopes uses the same active treatment: **4px** body-text left marker, `px-3 py-2`, quiet blue selected background (`bg-info-surface`), and **bold labels at rest**. The marker takes body text colour rather than brand blue, matching the active nav underline in the header.
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
