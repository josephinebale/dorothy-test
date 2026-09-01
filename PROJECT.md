# House Manager prototype — current project

Folder: `/Users/josephine/Downloads/dorothy-test`  
Stack: React 19 + TypeScript + Vite 6 + Tailwind 4. No other runtime dependencies. Icons: `lucide-react`.

This is a research prototype of **Hireup for Providers**, for a House Manager who runs one SIL location at a time. It should feel like the existing product, not a redesign. Do not invent new visual language, new tokens, or new dependencies unless asked.

Dev server: `npm run dev` → http://localhost:3020/ (hash routes, e.g. `#/bookings`).  
Typecheck: `npm run lint` (`tsc --noEmit`).  
Tests: `node --test --experimental-strip-types tests/*.test.ts` (there is no `npm test` script).

Live: https://josephinebale.github.io/dorothy-test/ (GitHub Pages via `.github/workflows/deploy.yml` on `main`. Vite `base: './'` so assets work on a sub-path.)

`README.md` is older and incomplete. **This file is the source of truth** for how the prototype works now.

---

## Constraints for anyone changing this

- Location scope is ambient. The selected location persists across Dashboard, Bookings, Team, Messages. Do not add location as an in-section filter.
- In-section filters are attributes only: date, status, “Bookings I have created”.
- Keep labels that already exist unless asked to change them. Do not resolve open research questions in copy.
- Prefer tokens and primitives. Brand constants stay exact (see tokens).
- This folder is a standalone prototype, not the Argos repo.

Not built (stay stubbed unless asked): booking creation/request flows, Jobs, real profile editing, real document upload, multi-location aggregate views, incident-report form content.

---

## Three scopes (information architecture)

Every menu answers: what am I acting on?

| Scope | Switchable? | Where it lives |
|---|---|---|
| Location | Yes | Location switcher in header **tier 2**; most work |
| Organisation | No. One org per House Manager | Location menu → Organisation settings |
| You | No | Account control in tier 1 → Your account |

Source: `src/lib/informationArchitecture.ts`

- `ORGANISATION_NAME` = Cerebral Palsy Alliance
- `MANAGER_NAME` = Helen Dawson
- `CAN_EDIT_ORGANISATION_DETAILS` = **false**. Organisation settings use the same layout when editable; fields are read-only (Save/Upload disabled) when this is false. Flip only this flag.

---

## Session and routing

Hash router in `src/lib/router.ts`: `useHashRoute`, `navigate(path)`, `href(path)` → `#path`.

localStorage (`src/lib/session.ts`):

| Key | Meaning |
|---|---|
| `hm.lastHouseId` | Last selected location. Returning users skip “Choose your location”. |
| `hm.signedIn` | `'false'` means signed out. Anything else (including missing) is signed in. |
| `hm.sessionQuestions` | Research panel: questions, answers, quick notes, other notes |

Flow in `src/App.tsx`:

1. Not signed in → `SignedOut` (centred `max-w-content` — leave it centred)
2. Signed in, no location → `ChooseHouse` (left-aligned `width-main-column`)
3. Signed in with location → header + page + Session questions + footer

Log out is on the account menu. Signed-out screen: **Log back in** (keep last location) or **Log in as a new user** (clear last location).

Choose location description: “Select the location you typically manage supports for. You can change this at any time.”

---

## Header (two sticky tiers)

`src/components/AppHeader.tsx`

Heights (CSS): `--header-identity-height` 3rem (48px), `--header-nav-height` 3.5rem (56px). Inverted on purpose: identity is quieter; the scoped row dominates.

Both tiers share `max-w-page` and `px-8` with the page body, so logo, location switcher, and page titles share one left edge.

Surface: white, with exactly two hairlines — one between the tiers (`.app-header-identity` bottom border) and one under the whole header (`.app-header` box shadow). No borders around the controls themselves.

**Tier 1 — identity** (`.app-header-identity` > `.app-header-row`)

- Left: Hireup lockup (`Logo` from `src/assets/logo-provider.svg`, inline vector).
- Right: Messages, Notifications, hairline divider, then account. All are ghost `Button`s (labelled, not icon-only), borderless, with a quiet hover fill.
  - Messages: MessageCircle + “Messages” + `Badge` when unread > 0. Goes to `/messages`. Accessible name from `messagesAccessibleName`.
  - Notifications: Bell + “Notifications” + `Badge` when count > 0. Goes to `/notifications`. Accessible name from `notificationsAccessibleName`.
  - Account: avatar + “Helen Dawson” + chevron. Menu is personal only (Profile, Account, Privacy, Password, Log out). Keyboard: `useKeyboardMenu`.

**Tier 2 — scope + nav** (`.app-header-nav-row`)

Reads as a sentence: these sections, inside this location.

- Left: location switcher (`HouseSwitcher`).
- Hairline divider.
- Nav: Dashboard `/` · Bookings `/bookings` · Team `/team` (`TEAM_ROUTE`).

Count badges sit **beside** the label, not on an icon. Zero → no badge. Cap 99+. Accessible names in `header-utils.ts`. Active: brand underline flush with the bottom of the row (`.main-nav-link--active`). Hover is a quiet grey underline, never a filled pill — the underline needs this tier's bottom edge to anchor to.

Location control face: `HouseMarker` (rounded square, per-location colour) + location name + chevron, on one line. Borderless with a hover fill, not an outlined box. Organisation name is **not** on the face; it heads the menu instead.

Location menu (`left-0` under the control), two groups, one quiet row treatment:

1. Organisation name as a plain label, then the location list (marker, name, suburb and state). Current location: check next to the name, `bg-surface-selected`.
2. Divider, then “Manage this location”, then “Organisation settings”.

Location rows are choices, not `EntityLink`s.

### Shape rule: square is a place, circle is a person

Shape carries the meaning, so the two marker styles are consistent rather than arbitrary.

- **Rounded square = location.** `HouseMarker` + `src/lib/houseMarker.ts`: five CPA palette tones (green, lime, purple, orange, blue), surface + foreground, AA contrast, colour derived from the location id so a location keeps its colour. Used in the switcher face, every location menu row, and the Choose your location list.
- **Circle = person.** `Avatar`: real photo where one exists (`src/data/avatars.ts`), otherwise a dark circular initials fallback. No ring. Used for workers and the account holder.

Never a circular initials mark for a location, and never a square photo for a person. Helen Dawson has no portrait asset, so the account control shows circular “HD” initials.

---

## Footer

`src/components/AppFooter.tsx`

Compact logo (links to dashboard) · Help Centre · Knowledge hub · Contact Us · Terms of Use · Privacy Policy · copyright.

`py-3`, links `text-xs text-text-secondary`, underline on hover only. Top spacing `--footer-gap` (`--space-7` / 40px) via `.page-footer`.

---

## Layout: one narrow column, one main column

`--narrow-column-width: 20rem` (**320px**). Used wherever a page has a narrower column and a wider one, regardless of side: Bookings rail + filter card, Settings rails, Dashboard Team aside, Messages conversation list.

The narrow column is sized against the page, not fixed: at 1080 it was 220px, and it scaled to 320px when the page went to 1440 so the two columns stay in proportion (roughly **1 : 3.2**) rather than the narrow one thinning out. If the page width changes again, rescale this token to hold that ratio. Floor is 210px.

`--main-column-width` is **derived**, not hardcoded:

```
page (1440) − 2 × page inline padding (32) − aside (320) − gap (24) = 1032px
```

Utility `.width-main-column`: left-aligned, max that width (and `100% − aside − gap` below the page max). Applied to Team, Notifications, Stub, ChooseHouse. Empty space on the right (where Dashboard has the aside) is intended so the left edge stays put when switching tabs.

Archetypes (`.layout-*` in `index.css`):

| Pattern | Pages |
|---|---|
| Rail plus content | Bookings, all three Settings pages |
| Master plus detail | Messages (list + thread share one bordered shell) |
| Content plus aside | Dashboard |

Team page: `width-main-column`, left-aligned (not `mx-auto`). Do not centre it.

---

## Pages and routes

Page shell: `mx-auto w-full max-w-page px-8 pt-8 pb-4` (`src/App.tsx`), where `--container-page` is **1440px**. Page titles: `PageHeading` (optional `description` and `actions`). Page title type: `text-xl font-bold`.

| Path | Page | Notes |
|---|---|---|
| `/` | Dashboard | Notification strip, week of bookings, **Most booked workers** aside. Heading actions: Request booking (primary) then Report incident (secondary). `layout-content-aside`, `items-baseline`. |
| `/bookings` | Bookings | Status rail (Requested, Confirmed, Waiting for submission, Ready to approve, Next invoice, Invoiced). Filters: worker, date from/to, “Bookings I have created”. Apply filters and Reset sit **side by side**, both **secondary** (outlined), `flex-1` so they split the card in equal halves. Neither is blue: the page's only primary is Request booking. |
| `/messages` | Messages | Location-scoped conversations. List uses the narrow column. |
| `/team` | Team | Location-scoped workers, alphabetical list + overflow. Route is `/team`, never `/workers`. |
| `/notifications` | Notifications | Full list matching the dashboard strip. |
| `/manage-house`… | Manage this location | Left rail + cards. Default: Support worker preferences. Rail items have **no chevron** (active = blue left border + medium weight), matching Bookings status rail. |
| `/organisation-settings`… | Organisation settings | Gated by `CAN_EDIT_ORGANISATION_DETAILS`. |
| `/your-account`… | Your account | `/settings` also lands here. |
| `/report-incident`, `/request-booking`, footer stubs | Stub | `width-main-column`. |

Settings section IDs (append to base path, e.g. `#/manage-house/people`):

Manage this location: `preferences`, `support-areas`, `specialised`, `covid`, `support-plan`, `house-name`, `house-picture`, `people`  
Organisation: `organisation`, `financial`, `documents`, `people`  
Your account: `about-you`, `profile-picture`, `account`, `privacy`, `password`

Keep section **labels** unchanged unless asked.

**People** is one list used at location and organisation scope. Row: avatar, name, secondary line, overflow. Location line: what they can do in this location. Org line: which locations they can see.

---

## Dashboard details that have been iterated

**Notifications strip** (`NotificationStrip.tsx`)

- Heading row: “Notifications” + **View all** (blue underlined text link) → `/notifications`.
- Two of three cells are links (booking requests, bookings to approve); the third (“No new job applicants”) is not. Link titles: blue, underlined, **bold**.
- Voice: contractions (“We'll”) and “let you know”.

**Week grid** (`BookingsWeek.tsx`)

- Day column is **147px** at the 1440 page width (1032 main ÷ 7). **“Pialligo, ACT” stays on one line.**
- Status pills: solid fill (`StatusPill`), `flex w-full items-center justify-center`, label centred. Do not tint pills the same as the Card tone.
- Empty days: “No bookings”.
- Data generator (`houses.ts`): today always has ≥2 shifts; yesterday always has ≥1 completed shift except when today is Monday (no earlier day in the displayed week).

**Most booked workers panel** (`TeamPanel.tsx`) — heading is **Most booked workers**, not “Team”. “View team” is a blue underlined text link to `/team`.

Each worker row:

- Line 1: avatar + name (`EntityLink` to `/team`, stretched-link pattern, **blue and underlined** like the original — `.ui-target-row__link--text`).
- Line 2: **Message** (`MessageCircle`) and **Book** (`Calendar`) as small **secondary** buttons (border, white fill, 4px radius), icon then label. Not indented: they start on the **row's content edge, level with the avatar's left edge**, so each row has one left edge for both lines. 8px between the two buttons, `mt-3` from the name line; the row-to-row gap stays wider (24px) so each row still reads as one unit.
- Name is the primary target. Buttons are quieter (medium 500, bordered). Layered above the stretched link (`ui-target-row__action`). Hover fill on a button is deeper than the row hover so they stay distinct.

Avatar photos have **no ring**. Initials avatars are dark fill, light letters (people only; locations use `HouseMarker`).

---

## Type scale and links

Scale (replace nothing with 18px — that step was removed):

| Token | Size / line | Job |
|---|---|---|
| `text-xs` | 12 / 16 | captions, metadata, badges, footer |
| `text-sm` | 14 / 20 | body, list rows, buttons |
| `text-md` | 16 / 24 | section headings |
| `text-lg` | 20 / 28 | empty-state titles, some section titles |
| `text-xl` | 24 / 32 | page titles |

Weights: normal, medium, bold.

Link tiers:

1. **Inline / footer**: blue + underline (`text-brand`, hover underline on footer).
2. **Whole row/card is the target**: Team rows, Messages conversations, booking cards, notification strip cells. Name is strong 14px, not blue, not underlined. Hover tints the row. One focus ring on the row. Stretched link: name is the `<a>`, `::after` covers the row; secondary controls use `ui-target-row__action` (z-index 2). **Never nest buttons inside an anchor.**
3. **Secondary actions**: real buttons (ghost or secondary), not extra underlined text.

Exceptions that stay blue underlined text links: **View all**, **View team**, and notification strip **titles** that are links (`.ui-target-row__link--text`).

---

## Design tokens (live)

`src/index.css` (`@theme` + `:root`).

Keep exactly (real product): brand `#1424E0` / hover `#0F1CB8`, badge red `#D6244A`, page `#eff1f5`, body text `#16181d`, logo lockup.

Named greys: page, surface, surface-subtle, surface-selected, border, border-subtle, text, text-strong, text-secondary, text-tertiary.

Status: success, pending, neutral, info (each with a surface).

Radius: control 4px (buttons, pills), surface 8px (cards). Nested week booking cards: `!rounded-sm`.

Spacing `--space-1`…`--space-8` = 4, 8, 12, 16, 24, 32, 40, 48px. `--spacing` = `--space-1`, so Tailwind `gap-6` is **24px**, not `--space-6` (32px). Dashboard section stacks use `space-y-6` = 24px.

Avatars: sm 28, md 36, lg 44.

Buttons: default 36px, small 32px. IconButton matches. Request booking is primary. Save is secondary (bordered).

---

## UI primitives

`src/components/ui/`: `Button`, `IconButton`, `Card`, `EntityLink`, `Badge`, `Tag`, `classes.ts`.

Also: `Avatar`, `HouseMarker`, `PageHeading`, `StatusPill`, `Logo`.

Counts and labels — pick by whether the thing is interactive:

- `Badge` — alert count sitting on a control. 14px, red `--color-badge`, `aria-hidden`, hidden at 0. Header nav and Messages rows only.
- `Tag` — non-interactive label. 26px, 12px medium, 4px radius. `neutral` is a white fill with a `--color-border` hairline; a tinted grey would match `--color-page` and disappear. `success` is `--color-success-surface`. Used for the week-heading count, booking price, and session-note page label.

StatusPill solid:

- confirmed: `bg-success text-surface`
- requested: `bg-pending text-surface`
- ended: `bg-neutral text-surface`

Icons: `h-4 w-4` inline, `h-5 w-5` standalone. Do not override `strokeWidth`.

---

## Session questions (research overlay)

Question-mark `IconButton`, bottom right. Sticky, not fixed.

Dock is **zero-height** (`.session-questions-dock`); button absolutely positioned (`.session-questions-button`). Do not use `fixed` (overlaps footer). Do not give the dock flow height (dead space).

Panel: quick notes tagged with current page, four editable starter questions, Other notes, Copy all notes. Persistence: `hm.sessionQuestions`.

---

## Placeholder data

`src/data/houses.ts` — five locations:

- Dee Why 1, Dee Why NSW (`dee-why-1`) — typical default
- Galston 1, Galston NSW
- Hornsby, Hornsby NSW
- North Ryde 1, North Ryde NSW
- Wahroonga, Wahroonga NSW

These are alphabetised public CPA SIL listing names and suburbs, not private street addresses.

Each has its own roster and bookings, seeded relative to **today**. Avatars: `src/data/avatars.ts`. Messages: `src/data/conversations.ts`.

---

## Known issues / next likely work

**Messages list.** Name and full date (`24 Aug 2026`) share one line, which truncated **Charlies K** and **Geoffrey L** while `--narrow-column-width` was 220px. At 320px nothing truncates, so this is resolved for now. If the token narrows again, move the date onto the preview line (right-aligned opposite the unread badge) rather than making Messages an exception to `--narrow-column-width`.

---

## Copy conventions

Empty states: title + description (what is absent, what makes something appear). `EMPTY_STATES` in `pageContent.ts`.

The word for the worker list is **Team** in nav, Team page, route (`/team`), and “View team”. The Dashboard aside heading is **Most booked workers** (the ordering, not the concept name).

Booking cards do **not** repeat Location and Worker as labelled rows. The worker is already in the nested box; the location is already the page’s selected context.

---

## Open research (do not “solve” in UI)

Whether a House Manager should switch locations. The switcher is visible on purpose.

Whether the Team list should stay location-scoped. It is location-scoped.

Whether a House Manager can edit organisation details. Flag is off; layout exists for both states.

---

## File map

```
src/App.tsx
src/index.css
src/main.tsx
src/assets/logo-provider.svg
src/components/AppHeader.tsx
src/components/AppFooter.tsx
src/components/HouseSwitcher.tsx
src/components/HouseMarker.tsx
src/components/Logo.tsx
src/components/Avatar.tsx
src/components/PageHeading.tsx
src/components/StatusPill.tsx
src/components/header-utils.ts
src/components/SessionQuestions.tsx
src/components/SessionQuestionsPanel.tsx
src/components/ui/{Button,IconButton,Card,EntityLink,Badge,Tag,classes}.ts(x)
src/data/{houses,avatars,conversations}.ts
src/lib/router.ts
src/lib/session.ts
src/lib/date.ts
src/lib/pageContent.ts
src/lib/informationArchitecture.ts
src/lib/useKeyboardMenu.ts
src/lib/sessionQuestions.ts
src/lib/houseMarker.ts
src/pages/Dashboard.tsx
src/pages/dashboard/{NotificationStrip,BookingsWeek,TeamPanel}.tsx
src/pages/Bookings.tsx
src/pages/Team.tsx
src/pages/Messages.tsx
src/pages/Notifications.tsx
src/pages/Settings.tsx
src/pages/ChooseHouse.tsx
src/pages/SignedOut.tsx
src/pages/Stub.tsx
tests/*.test.ts
.github/workflows/deploy.yml
```

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
