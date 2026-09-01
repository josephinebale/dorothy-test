# House Manager dashboard prototype

A prototype of the provider experience for a House Manager who runs a single SIL location, built to
match the existing Hireup for Providers UI. React, Vite and Tailwind, no other dependencies.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3020/

## Checking it still compiles

```bash
npm run lint
```

## What is built

- **Dashboard**, scoped to the selected location: a notifications strip, the week view of upcoming
  bookings with week navigation, and a Team panel showing the most booked workers for that
  location.
- **Location switcher** in the global nav. Switching keeps you on the page you are on
  and swaps the location context.
- **First run**: with no remembered location, you land on a "Choose your location" screen. After that you
  go straight into your last location on every visit. The choice is stored in the browser's
  local storage.
- **Bookings**, scoped to the selected location: status views, worker and date filters, a
  "Bookings I have created" toggle, and booking detail cards.
- **Team**, scoped to the selected location: an alphabetical worker list using the existing Team
  page treatment.
- **Messages**, scoped to the selected location: conversation list, empty state, and a thread view
  matching the existing Messages layout.
- **Stub pages** for Settings and everything in the account menu, so the remaining structure can
  be navigated end to end.

## Session questions (for research sessions)

The question-mark button at the bottom right opens one **Session questions** panel.

- **Quick note** adds an in-the-moment note tagged with the screen that is currently open. Quick
  notes appear in a running list and can be deleted individually.
- Four editable starter questions each have an answer area, followed by an **Other notes** area.
- Everything is saved in the browser under `hm.sessionQuestions`, so it survives a reload during a
  session.
- **Copy all notes** copies the page-tagged quick notes, planned questions and answers, and other
  notes as plain text ready to paste into a shared document.

## Testing the first-run experience

The account menu (top right) has **Log out**. That screen offers:

- **Log back in** — returns you to the location you were last in.
- **Log in as a new user** — forgets the remembered location so you see "Choose your location" again.

## Placeholder data

Five alphabetised public Cerebral Palsy Alliance SIL listing names and suburbs, each with its own
placeholder roster and bookings. Private street addresses are not used. Bookings are generated from
a fixed seed relative to today, so the data is stable between reloads but the week view always
includes today. See `src/data/locations.ts`.

## Not built

Booking creation or request flows, Jobs, profile editing, settings content, and multi-location
aggregate views.
