# Location Manager prototype — current project

Give **this whole file** to another agent. It is the source of truth. `README.md` is older and incomplete.

Folder: `/Users/josephine/Downloads/dorothy-test`  
Stack: React 19 + TypeScript + Vite 6 + Tailwind 4. Icons: `lucide-react`. No other runtime dependencies.

This is a research prototype of **Hireup for Providers**, for a manager who works in **one location at a time**. A location might be a house or a centre — **code and UI say location**, never house or centre, so the term stays open. The research persona may still be described as a House Manager in conversation.

It should feel like the existing Hireup product, not a redesign. Do not invent new visual language, tokens, or dependencies unless asked.

## How to run

```bash
npm install
npm run dev          # http://localhost:3020/  (hash routes, e.g. #/bookings)
npm run lint         # tsc --noEmit
node --test tests/*.test.ts
```

There is no `npm test` script.

Live: https://josephinebale.github.io/dorothy-test/  
GitHub Pages via `.github/workflows/deploy.yml` on **`main`**. Vite `base: './'`.

To publish: work on a branch, fast-forward `main`, `git push origin main`. Do not force-push. Do not commit straight to `main` as a working habit.

---

## Constraints

- Location scope is ambient. The selected location persists across Dashboard, Bookings, Team, Messages. Do not add location as an in-section filter.
- In-section filters are attributes only: date, status, “Bookings I have created”.
- Keep existing labels unless asked. Do not “solve” open research questions in copy.
- Prefer tokens and primitives. Brand constants stay exact (see tokens).
- This folder is a standalone prototype, not the Argos repo.
- In code, the unit of work is a **location** (files, types, routes). Do not rename it house or centre.

Not built (stay stubbed unless asked): booking creation/request flows, Jobs, real profile editing, real document upload, multi-location aggregate views, incident-report form content.

---

## Three scopes

Every menu answers: what am I acting on?

| Scope | Switchable? | Where it lives |
|---|---|---|
| Location | Yes | Location switcher in header **tier 2**; most work |
| Organisation | No. One org per manager | Location menu → Organisation settings |
| You | No | Account control in tier 1 → Your account |

Source: `src/lib/informationArchitecture.ts`

- `ORGANISATION_NAME` = Cerebral Palsy Alliance
- `MANAGER_NAME` = Helen Dawson
- `CAN_EDIT_ORGANISATION_DETAILS` = **false**. Same layout when editable; Save/Upload disabled when false. Flip only this flag.

---

## Session and routing

Hash router: `src/lib/router.ts` — `useHashRoute`, `navigate(path)`, `href(path)` → `#path`.

`canonicalPath` rewrites old bookmarks so they do not break:

- `#/manage-house` → `#/manage-location`
- `…/house-name` → `…/location-name`
- `…/house-picture` → `…/location-picture`

localStorage (`src/lib/session.ts`):

| Key | Meaning |
|---|---|
| `hm.lastLocationId` | Last selected location. Returning users skip “Choose your location”. |
| `hm.lastHouseId` | **Legacy only.** Still *read* so existing browsers keep their choice. New writes use `hm.lastLocationId`. |
| `hm.signedIn` | `'false'` means signed out. Anything else (including missing) is signed in. |
| `hm.sessionQuestions` | Research panel |

Flow in `src/App.tsx`:

1. Not signed in → `SignedOut` (centred `max-w-content` — leave it centred)
2. Signed in, no location → `ChooseLocation` (left-aligned `width-main-column`)
3. Signed in with location → header + page + Session questions + footer

Log out is on the account menu. Signed-out screen: **Log back in** (keep last location) or **Log in as a new user** (clear last location).

Choose location copy: “Select the location you typically manage supports for. You can change this at any time.”

---

## Header (two sticky tiers)

`src/components/AppHeader.tsx`

Heights: `--header-identity-height` 3rem (48px), `--header-nav-height` 3.5rem (56px). Identity is quieter; the scoped row dominates.

Both tiers share `max-w-page` and `px-8` with the page body.

Surface: white, two hairlines only — between the tiers, and under the whole header. No borders around the controls.

**Tier 1 — identity**

- Left: Hireup lockup (`Logo` from `src/assets/logo-provider.svg`).
- Right: Messages, Notifications, hairline, then account. Ghost `Button`s, labelled, not icon-only.
  - Messages: lucide `MessageCircle` + “Messages” + `Badge` when unread > 0 → `/messages`
  - Notifications: `Bell` + “Notifications” + `Badge` when count > 0 → `/notifications`
  - Account: circular avatar + “Helen Dawson” + chevron. Menu is personal only (Profile, Account, Privacy, Password, Log out). Keyboard: `useKeyboardMenu`.

**Tier 2 — scope + nav**

- Left: `LocationSwitcher`
- Hairline
- Nav: Dashboard `/` · Bookings `/bookings` · Team `/team` (`TEAM_ROUTE`)

Count badges sit **beside** the label. Zero → no badge. Cap 99+. Accessible names in `header-utils.ts`. Active: brand underline on the row bottom (`.main-nav-link--active`). Hover is a quiet grey underline, never a filled pill.

Location control face: `LocationMarker` + location name + chevron, one line. Borderless, hover fill. Organisation name is **not** on the face; it heads the menu.

Location menu (`left-0`), two groups:

1. Organisation name as a plain label, then the location list (marker, name, suburb and state). Current: check + `bg-surface-selected`.
2. Divider, then “Manage this location”, then “Organisation settings”.

Location rows are choices, not `EntityLink`s.

The “Manage this location” row uses lucide’s **`House` icon** (a pictogram from the icon library). That is not our domain word for the place.

### Shape rule: square is a place, circle is a person

- **Rounded square = location.** `LocationMarker`. **One** colour for every location, from the only green in the Cerebral Palsy Alliance logo (`#2E953E`). `--color-location-surface` `#E6F2E8` (12% tint over white). `--color-location-foreground` `#216B2D` (same green darkened until initials clear AA, ~5.7:1). Initials distinguish locations, not colour. Do not invent extra marker colours without a brand source.
- **Circle = person.** `Avatar`: photo from `src/data/avatars.ts` if one exists, otherwise dark circular initials. **No ring.**

Never a circular initials mark for a location, and never a square photo for a person. Helen Dawson has no portrait, so the account control shows circular “HD”.

---

## Footer

`src/components/AppFooter.tsx`

Compact logo (links to dashboard) · Help Centre · Knowledge hub · Contact Us · Terms of Use · Privacy Policy · copyright.

`py-3`, links `text-xs text-text-secondary`, underline on hover only. Top spacing `--footer-gap` (`--space-7` / 40px).

---

## Layout

`--narrow-column-width: 20rem` (**320px**). Used wherever a page has a narrower column and a wider one: Bookings rail + filters, Settings rails, Dashboard Team aside, Messages conversation list.

Ratio vs main column is roughly **1 : 3.2** at 1440. Floor 210px if the page width changes.

`--main-column-width` is **derived**:

```
page (1440) − 2 × page inline padding (32) − aside (320) − gap (24) = 1032px
```

`.width-main-column`: left-aligned. Applied to Team, Notifications, Stub, ChooseLocation. Empty space on the right (where Dashboard has the aside) is intended so the left edge stays put when switching tabs.

Archetypes:

| Pattern | Pages |
|---|---|
| Rail plus content | Bookings, all three Settings pages |
| Master plus detail | Messages |
| Content plus aside | Dashboard |

Team page: `width-main-column`, left-aligned. Do not centre it.

Page shell: `mx-auto w-full max-w-page px-8 pt-8 pb-4`. `--container-page` is **1440px**. Page titles: `PageHeading`, `text-xl font-bold`.

---

## Pages and routes

| Path | Page | Notes |
|---|---|---|
| `/` | Dashboard | Notification strip, week of bookings, **Most booked workers** aside. Heading actions: Request booking (primary) then Report incident (secondary). `layout-content-aside`, `items-baseline`. |
| `/bookings` | Bookings | Status rail (Requested, Confirmed, Waiting for submission, Ready to approve, Next invoice, Invoiced). Filters: worker, date from/to, “Bookings I have created”. Apply filters and Reset **side by side**, both **secondary**, `flex-1`. Page’s only primary is Request booking. |
| `/messages` | Messages | Location-scoped conversations. List uses the narrow column. |
| `/team` | Team | Location-scoped workers, alphabetical. Route is `/team`, never `/workers`. |
| `/notifications` | Notifications | Full list matching the dashboard strip. |
| `/manage-location`… | Manage this location | Left rail + cards. Default: Support worker preferences. Rail: **no chevron**; active = blue left border + medium weight. |
| `/organisation-settings`… | Organisation settings | Gated by `CAN_EDIT_ORGANISATION_DETAILS`. |
| `/your-account`… | Your account | `/settings` also lands here. |
| `/report-incident`, `/request-booking`, footer stubs | Stub | `width-main-column`. |

Settings section IDs (append to base path, e.g. `#/manage-location/people`):

Manage this location: `preferences`, `support-areas`, `specialised`, `covid`, `support-plan`, `location-name`, `location-picture`, `people`  
Organisation: `organisation`, `financial`, `documents`, `people`  
Your account: `about-you`, `profile-picture`, `account`, `privacy`, `password`

Keep section **labels** unchanged unless asked.

**People** is one list at location and organisation scope. Row: avatar, name, secondary line, overflow. Location line: what they can do in this location. Org line: which locations they can see.

---

## Dashboard details that have been iterated

**Notifications strip**

- “Notifications” + **View all** (blue underlined text link) → `/notifications`.
- Two of three cells are links (requests, bookings to approve); “No new job applicants” is not. Link titles: blue, underlined, **bold**.
- Voice: contractions (“We'll”) and “let you know”.

**Week grid**

- Day column ~**147px** at 1440 (1032 ÷ 7). Suburb lines such as “Dee Why, NSW” stay on one line.
- Status pills: solid fill (`StatusPill`), full width of the chip, **label centred**. Do not tint pills the same as the Card tone.
- Empty days: “No bookings”.
- Data generator: today always has ≥2 shifts; yesterday always has ≥1 completed shift except when today is Monday.

Week heading count uses **`Tag`**, not `Badge` (filled grey chip, no outline).

**Most booked workers** (`TeamPanel.tsx`) — heading is **Most booked workers**, not “Team”. “View team” is a blue underlined text link to `/team`.

Each worker row:

- Line 1: **medium** avatar (36px, same as the Team list) + name (`EntityLink` to `/team`, **blue and underlined** — `.ui-target-row__link--text`).
- Line 2: **Message** and **Book** as small **secondary** buttons, icon then label. Left-aligned with the avatar’s left edge. `mt-3` from the name line.
- Name is the primary target. Buttons layered above the stretched link (`ui-target-row__action`).

---

## Type scale and links

| Token | Size / line | Job |
|---|---|---|
| `text-xs` | 12 / 16 | captions, metadata, badges, footer |
| `text-sm` | 14 / 20 | body, list rows, buttons |
| `text-md` | 16 / 24 | section headings |
| `text-lg` | 20 / 28 | empty-state titles |
| `text-xl` | 24 / 32 | page titles |

No 18px step. Weights: normal, medium, bold.

Link tiers:

1. **Inline / footer**: blue + underline.
2. **Whole row/card is the target**: Team rows, Messages conversations, booking cards, notification strip cells. Name is strong 14px, not blue, not underlined — **except** worker names that use `.ui-target-row__link--text`. Hover tints the row. One focus ring. Stretched link: name is the `<a>`, `::after` covers the row; secondary controls use `ui-target-row__action`. **Never nest buttons inside an anchor.**
3. **Secondary actions**: real buttons.

Exceptions that stay blue underlined text links: **View all**, **View team**, and notification strip **titles** that are links.

---

## Design tokens

`src/index.css` (`@theme` + `:root`).

Keep exactly (real product): brand `#1424E0` / hover `#0F1CB8`, badge red `#D6244A`, page `#eff1f5`, body text `#16181d`, logo lockup.

Radius: control 4px, surface 8px. Nested week booking cards: `!rounded-sm`.

Spacing `--space-1`…`--space-8` = 4, 8, 12, 16, 24, 32, 40, 48px. `--spacing` = `--space-1`, so Tailwind `gap-6` is **24px**.

Avatars: sm 28, md 36, lg 44. Dashboard most-booked rows use **md**.

Buttons: default 36px, small 32px. IconButton matches. Request booking is primary. Save is secondary (bordered).

`--color-neutral-surface` must stay a step darker than `--color-page` or a grey fill disappears.

---

## UI primitives

`src/components/ui/`: `Button`, `IconButton`, `Card`, `EntityLink`, `Badge`, `Tag`, `classes.ts`.

Also: `Avatar`, `LocationMarker`, `PageHeading`, `StatusPill`, `Logo`.

- `Badge` — alert count on a **control**. 14px, red, `aria-hidden`, hidden at 0. Header nav and Messages rows only.
- `Tag` — non-interactive label. Filled, **borderless** (must not look like a button). `neutral` = `--color-neutral-surface`. `success` = `--color-success-surface`. Week-heading count, booking price, session-note page label.

StatusPill solid: confirmed `bg-success text-surface`; requested `bg-pending text-surface`; ended `bg-neutral text-surface`.

**Icons:** one size everywhere, `h-5 w-5` (20px). No 16px decorative icons. `tests/icon-size.test.ts` scans every lucide usage. Checkbox inputs may stay 16px (form controls). Do not override `strokeWidth`.

---

## Session questions (research overlay)

Question-mark `IconButton`, bottom right. Sticky, not fixed.

Dock is **zero-height** (`.session-questions-dock`); button absolutely positioned. Do not use `fixed`. Do not give the dock flow height.

Panel: quick notes tagged with current page, four editable starter questions, Other notes, Copy all notes. Persistence: `hm.sessionQuestions`.

---

## Placeholder data

`src/data/locations.ts` — five **alphabetised public CPA SIL listing names and suburbs**, not private street addresses:

- Dee Why 1, Dee Why NSW (`dee-why-1`) — typical default
- Galston 1, Galston NSW
- Hornsby, Hornsby NSW
- North Ryde 1, North Ryde NSW
- Wahroonga, Wahroonga NSW

Each has its own roster and bookings, seeded relative to **today**. Avatars: `src/data/avatars.ts`. Messages: `src/data/conversations.ts`.

---

## Copy conventions

Empty states: title + description (what is absent, what makes it appear). `EMPTY_STATES` in `pageContent.ts`.

The worker list is **Team** in nav, Team page, route (`/team`), and “View team”. The Dashboard aside heading is **Most booked workers**.

Booking cards do **not** repeat Location and Worker as labelled rows. The worker is in the nested box; the location is the page’s selected context.

---

## Open research (do not “solve” in UI)

Whether a manager should switch locations. The switcher is visible on purpose.

Whether the Team list should stay location-scoped. It is location-scoped.

Whether a manager can edit organisation details. Flag is off; layout exists for both states.

---

## Known issues

**Messages list.** Name and full date used to truncate at 220px narrow column. At 320px nothing truncates. If the token narrows again, move the date onto the preview line rather than making Messages an exception to `--narrow-column-width`.

---

## File map

```
src/App.tsx
src/index.css
src/main.tsx
src/assets/logo-provider.svg
src/components/AppHeader.tsx
src/components/AppFooter.tsx
src/components/LocationSwitcher.tsx
src/components/LocationMarker.tsx
src/components/Logo.tsx
src/components/Avatar.tsx
src/components/PageHeading.tsx
src/components/StatusPill.tsx
src/components/header-utils.ts
src/components/SessionQuestions.tsx
src/components/SessionQuestionsPanel.tsx
src/components/ui/{Button,IconButton,Card,EntityLink,Badge,Tag,classes}.ts(x)
src/data/{locations,avatars,conversations}.ts
src/lib/router.ts
src/lib/session.ts
src/lib/date.ts
src/lib/pageContent.ts
src/lib/informationArchitecture.ts
src/lib/useKeyboardMenu.ts
src/lib/sessionQuestions.ts
src/pages/Dashboard.tsx
src/pages/dashboard/{NotificationStrip,BookingsWeek,TeamPanel}.tsx
src/pages/Bookings.tsx
src/pages/Team.tsx
src/pages/Messages.tsx
src/pages/Notifications.tsx
src/pages/Settings.tsx
src/pages/ChooseLocation.tsx
src/pages/SignedOut.tsx
src/pages/Stub.tsx
tests/*.test.ts
.github/workflows/deploy.yml
```

There are **no** `houses.ts`, `HouseMarker`, `HouseSwitcher`, or `ChooseHouse` files. Do not recreate them.

---

## Item move map (older account/settings dump)

| Item | Now |
|---|---|
| Help centre | Footer only |
| Knowledge hub | Footer, beside Help centre |
| Invoices | Bookings views “Next invoice” and “Invoiced” |
| Report incident | Dashboard heading (after Request booking) and booking cards |
| Support plan | Manage this location rail |
| Organisation details / Financial / Documents | Organisation settings |
| Support worker preferences / Support areas / Specialised / COVID-19 | Manage this location |
| Location name / Location picture / People (location) | Manage this location |
| People (org) | Organisation settings |
| About you / Profile picture / Account / Privacy / Password | Your account |
