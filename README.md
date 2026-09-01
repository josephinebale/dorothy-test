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
- **Settings** for this location, the organisation, and Helen’s account. The account menu goes to
  Your account or Log out. See `PROJECT.md` for which sections remain.

## Annotations (for research sessions)

The eye control at the bottom right shows or hides discussion-guide pins beside selected UI
elements. Pins open the question text only. Visibility is saved in the browser under
`hm.sessionQuestions`, so it survives a reload during a session.

## Testing the first-run experience

The account menu (top right) has **Log out**. That screen offers:

- **Log back in** — returns you to the location you were last in.
- **Log in as a new user** — forgets the remembered location so you see "Choose your location" again.

## Placeholder data

Five alphabetised public Cerebral Palsy Alliance SIL listing names and suburbs, each with its own
placeholder roster and bookings. Private street addresses are not used. Bookings are generated from
a fixed seed relative to today, so the data is stable between reloads but the week view always
includes today. See `src/data/locations.ts`.

## Booking requests

The prototype includes a three-step booking request flow for location and time, support details,
and worker selection. Submitted requests appear in the Requested bookings list and open into a
status and detail view. Created requests are kept for the current app session rather than sent
to a backend.

## Not built

Jobs, profile editing, settings content, and multi-location aggregate views.
