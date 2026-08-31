# House Manager prototype — current project

Folder: `/Users/josephine/Downloads/dorothy-test`  
Stack: React 19 + TypeScript + Vite 6 + Tailwind 4. No other runtime dependencies. Icons: `lucide-react`.

This is a research prototype of **Hireup for Providers**, for a House Manager who runs one SIL house at a time. It should feel like the existing product, not a redesign. Do not invent new visual language, new tokens, or new dependencies unless asked.

Dev server: `npm run dev` → http://localhost:3020/ (hash routes, e.g. `#/bookings`).  
Typecheck: `npm run lint` (`tsc --noEmit`).  
Tests: `node --test --experimental-strip-types tests/*.test.ts` (there is no `npm test` script).

Live: https://josephinebale.github.io/dorothy-test/ (GitHub Pages via `.github/workflows/deploy.yml` on `main`. Vite `base: './'` so assets work on a sub-path.)

`README.md` is older and incomplete. **This file is the source of truth** for how the prototype works now.

---

## Constraints for anyone changing this

- House scope is ambient. The selected house persists across Dashboard, Bookings, Team, Messages. Do not add house as an in-section filter.
- In-section filters are attributes only: date, status, “Bookings I have created”.
- Keep labels that already exist unless asked to change them. Do not resolve open research questions in copy.
- Prefer tokens and primitives. Brand constants stay exact (see tokens).
- This folder is a standalone prototype, not the Argos repo.

Not built (stay stubbed unless asked): booking creation/request flows, Jobs, real profile editing, real document upload, multi-house aggregate views, incident-report form content.

---

## Three scopes (information architecture)

Every menu answers: what am I acting on?

| Scope | Switchable? | Where it lives |
|---|---|---|
| House | Yes | House switcher in header **tier 2**; most work |
| Organisation | No. One org per House Manager | House menu → Organisation settings |
| You | No | Account control in tier 1 → Your account |

Source: `src/lib/informationArchitecture.ts`

- `ORGANISATION_NAME` = Hireup Demonstration Co
- `MANAGER_NAME` = Helen Dawson
- `CAN_EDIT_ORGANISATION_DETAILS` = **false**. Organisation settings use the same layout when editable; fields are read-only (Save/Upload disabled) when this is false. Flip only this flag.

---

## Session and routing

Hash router in `src/lib/router.ts`: `useHashRoute`, `navigate(path)`, `href(path)` → `#path`.

localStorage (`src/lib/session.ts`):

| Key | Meaning |
|---|---|
| `hm.lastHouseId` | Last selected house. Returning users skip “Choose your house”. |
| `hm.signedIn` | `'false'` means signed out. Anything else (including missing) is signed in. |
| `hm.sessionQuestions` | Research panel: questions, answers, quick notes, other notes |

Flow in `src/App.tsx`:

1. Not signed in → `SignedOut` (centred `max-w-content` — leave it centred)
2. Signed in, no house → `ChooseHouse` (left-aligned `width-main-column`)
3. Signed in with house → header + page + Session questions + footer

Log out is on the account menu. Signed-out screen: **Log back in** (keep last house) or **Log in as a new user** (clear last house).

Choose house description: “Select the house you manage supports for. You can change this at any time.”

---

## Header (two sticky tiers)

`src/components/AppHeader.tsx`

Heights (CSS): `--header-identity-height` 3rem (48px), `--header-nav-height` 3.5rem (56px). Inverted on purpose: identity is quieter; the scoped row dominates.

Both tiers share `max-w-page` and `px-8` with the page body, so logo, house switcher, and page titles share one left edge.

**Tier 1 — identity** (`.header-identity`)

- Left: Hireup lockup (`Logo` from `src/assets/logo-provider.svg`, inline vector).
- Right: Notifications control, hairline divider, then account control. Both are ghost `Button`s (labelled, not icon-only). Class `header-identity-control`.
  - Notifications: Bell + “Notifications” + `Badge` when count > 0. Goes to `/notifications`. Accessible name from `notificationsAccessibleName`.
  - Account: avatar + “Helen Dawson” + chevron. Menu is personal only (Profile, Account, Privacy, Password, Log out). Keyboard: `useKeyboardMenu`.

**Tier 2 — scope + nav** (`.header-navigation`)

Reads as a sentence: these sections, inside this house.

- Left: house switcher (`HouseSwitcher`).
- Hairline divider.
- Nav: Dashboard `/` · Bookings `/bookings` · Messages `/messages` · Team `/team` (`TEAM_ROUTE`).

Count badges sit **beside** the label, not on an icon. Zero → no badge. Cap 99+. Accessible names in `header-utils.ts`. Active: brand underline flush with the bottom of the row. Hover quieter than active.

House control face: `HouseMarker` (rounded square, per-house colour) + house name + chevron. Organisation name is **not** on the face.

House menu (`left-0` under the control), two groups, one quiet row treatment:

1. Organisation name as a plain label, then the house list (marker, name, suburb and state). Current house: check next to the name, `bg-surface-selected`.
2. Divider, then “Manage this house”, then “Organisation settings”.

House rows are choices, not `EntityLink`s.

`HouseMarker` + `src/lib/houseMarker.ts`: five tones (indigo, teal, amber, rose, violet), surface + foreground, AA contrast. Same square in the button and every menu row. Circles are for people only.

---

## Footer

`src/components/AppFooter.tsx`

Compact logo (links to dashboard) · Help Centre · Knowledge hub · Contact Us · Terms of Use · Privacy Policy · copyright.

`py-3`, links `text-xs text-text-secondary`, underline on hover only. Top spacing `--footer-gap` (`--space-7` / 40px) via `.page-footer`.

---

## Layout: one narrow column, one main column

`--narrow-column-width: 13.75rem` (**220px**). Used wherever a page has a narrower column and a wider one, regardless of side: Bookings rail + filter card, Settings rails, Dashboard Team aside, Messages conversation list.

Do not go below 210px. 220px was chosen after stacking the Bookings filter buttons, which used to force 260px.

`--main-column-width` is **derived**, not hardcoded:

```
page (1080) − 2 × page inline padding (32) − aside (220) − gap (24) = 772px
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

Page shell: `mx-auto w-full max-w-page px-8 pt-8 pb-4` (`src/App.tsx`). Page titles: `PageHeading` (optional `description` and `actions`). Page title type: `text-xl font-bold`.

| Path | Page | Notes |
|---|---|---|
| `/` | Dashboard | Notification strip, week of bookings, **Most booked** aside. Heading actions: Request booking (primary) then Report incident (secondary). `layout-content-aside`, `items-baseline`. |
| `/bookings` | Bookings | Status rail (Requested, Confirmed, Waiting for submission, Ready to approve, Next invoice, Invoiced). Filters: worker, date from/to, “Bookings I have created”. Apply filters = full-width **secondary**; Reset = full-width **ghost** beneath it. |
| `/messages` | Messages | House-scoped conversations. List is 220px. |
| `/team` | Team | House-scoped workers, alphabetical list + overflow. Route is `/team`, never `/workers`. |
| `/notifications` | Notifications | Full list matching the dashboard strip. |
| `/manage-house`… | Manage this house | Left rail + cards. Default: Support worker preferences. Rail items have **no chevron** (active = blue left border + medium weight), matching Bookings status rail. |
| `/organisation-settings`… | Organisation settings | Gated by `CAN_EDIT_ORGANISATION_DETAILS`. |
| `/your-account`… | Your account | `/settings` also lands here. |
| `/report-incident`, `/request-booking`, footer stubs | Stub | `width-main-column`. |

Settings section IDs (append to base path, e.g. `#/manage-house/people`):

Manage this house: `preferences`, `support-areas`, `specialised`, `covid`, `support-plan`, `house-name`, `house-picture`, `people`  
Organisation: `organisation`, `financial`, `documents`, `people`  
Your account: `about-you`, `profile-picture`, `account`, `privacy`, `password`

Keep section **labels** unchanged unless asked.

**People** is one list used at house and organisation scope. Row: avatar, name, secondary line, overflow. House line: what they can do in this house. Org line: which houses they can see.

---

## Dashboard details that have been iterated

**Notifications strip** (`NotificationStrip.tsx`)

- Heading row: “Notifications” + **View all** (blue underlined text link) → `/notifications`.
- Two of three cells are links (booking requests, bookings to approve); the third (“No new job applicants”) is not. Link titles: blue, underlined, **bold**.
- Voice: contractions (“We'll”) and “let you know”.

**Week grid** (`BookingsWeek.tsx`)

- Day columns gained ~6px when the aside went 260 → 220 (104.3px → 110px; inner 88 → 94). **“Pialligo, ACT” now stays on one line.**
- Status pills: solid fill (`StatusPill`), `flex w-full items-center justify-center`, label centred. Do not tint pills the same as the Card tone.
- Empty days: “No bookings”.
- Data generator (`houses.ts`): today always has ≥2 shifts; yesterday always has ≥1 completed shift except when today is Monday (no earlier day in the displayed week).

**Most booked panel** (`TeamPanel.tsx`) — heading is **Most booked**, not “Team”. “View team” is a blue underlined text link to `/team`.

Each worker row:

- Line 1: avatar + name (`EntityLink`, stretched-link pattern).
- Line 2: **Message** and **Book** as small **secondary** buttons (border, white fill, 4px radius), **no icons**, left-aligned to the **avatar / row content edge**, not indented under the name. 8px between the two buttons. 8px from name to buttons; ~25px from buttons to the next worker.
- Name is the primary target (bold 700). Buttons are quieter (medium 500, bordered). Layered above the stretched link (`ui-target-row__action`). Hover fill on a button is deeper than the row hover so they stay distinct.

Avatar photos have **no ring**. Initials avatars are dark fill, light letters (people only; houses use `HouseMarker`).

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

`src/components/ui/`: `Button`, `IconButton`, `Card`, `EntityLink`, `Badge`, `classes.ts`.

Also: `Avatar`, `HouseMarker`, `PageHeading`, `StatusPill`, `Logo`.

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

`src/data/houses.ts` — five houses:

- Bellbird Court, Pialligo ACT (`bellbird-court`) — typical default
- Kingfisher Place, Wollongong NSW
- Wattle Grove, Geelong VIC
- Rosella Rise, Greenwich NSW
- Banksia Street, Upper Swan WA

Each has its own roster and bookings, seeded relative to **today**. Avatars: `src/data/avatars.ts`. Messages: `src/data/conversations.ts`.

---

## Known issues / next likely work

**Messages list at 220px.** Name and full date (`24 Aug 2026`) share one line. Header text area is ~147px; dates take ~64–73px. **Charlies K** and **Geoffrey L** truncate. Proposed fix (not done): move the date onto the preview line, right-aligned opposite the unread badge, so the name gets the full width. Do not make Messages an exception to `--narrow-column-width` unless asked.

---

## Copy conventions

Empty states: title + description (what is absent, what makes something appear). `EMPTY_STATES` in `pageContent.ts`.

The word for the worker list is **Team** in nav, Team page, route (`/team`), and “View team”. The Dashboard aside heading is **Most booked** (the ordering, not the concept name).

Finance on a booking card: two labelled rows (House, Worker), not a middle-dot pair.

---

## Open research (do not “solve” in UI)

Whether a House Manager should switch houses. The switcher is visible on purpose.

Whether the Team list should stay house-scoped. It is house-scoped.

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
src/components/ui/{Button,IconButton,Card,EntityLink,Badge,classes}.ts(x)
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
| Support plan | Manage this house rail |
| Organisation details / Financial / Documents | Organisation settings |
| Support worker preferences / Support areas / Specialised / COVID-19 | Manage this house |
| House name / House picture / People (house) | Manage this house |
| People (org) | Organisation settings |
| About you / Profile picture / Account / Privacy / Password | Your account |
