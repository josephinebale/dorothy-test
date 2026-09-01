import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getLocationData, LOCATIONS } from '../src/data/locations.ts';
import { addDays, isSameDay, startOfDay, startOfWeek } from '../src/lib/date.ts';

test('CPA SIL locations use public listing names in alphabetical order', () => {
  const source = readFileSync(
    new URL('../src/data/locations.ts', import.meta.url),
    'utf8',
  );
  const expectedLocations = [
    "{ id: 'dee-why-1', name: 'Dee Why 1', suburb: 'Dee Why', state: 'NSW' }",
    "{ id: 'galston-1', name: 'Galston 1', suburb: 'Galston', state: 'NSW' }",
    "{ id: 'hornsby', name: 'Hornsby', suburb: 'Hornsby', state: 'NSW' }",
    "{ id: 'north-ryde-1', name: 'North Ryde 1', suburb: 'North Ryde', state: 'NSW' }",
    "{ id: 'wahroonga', name: 'Wahroonga', suburb: 'Wahroonga', state: 'NSW' }",
  ];

  let previousIndex = -1;
  for (const location of expectedLocations) {
    const index = source.indexOf(location);
    assert.ok(index > previousIndex, `${location} must appear in alphabetical order`);
    previousIndex = index;
  }
});

test('each location team is sized like a CPA SIL house roster', () => {
  for (const location of LOCATIONS) {
    const size = getLocationData(location.id).workers.length;
    assert.ok(
      size >= 10 && size <= 18,
      `${location.name} has ${size} workers; a SIL house roster is typically 10–18 regulars`,
    );
  }
});

/* The week keeps its 24/7 SIL shape — day staff plus an overnight — but at a
   volume a participant can read in a session rather than a full roster. */
test('every day this week has day staff and a sleepover', () => {
  const weekStart = startOfWeek(startOfDay(new Date()));

  for (const location of LOCATIONS) {
    const data = getLocationData(location.id);
    for (let i = 0; i < 7; i += 1) {
      const day = addDays(weekStart, i);
      const dayBookings = data.bookings.filter((booking) => isSameDay(booking.start, day));
      assert.ok(
        dayBookings.length >= 2,
        `${location.name} ${day.toDateString()} has ${dayBookings.length} bookings; a SIL day needs day staff plus overnight`,
      );
      assert.ok(
        dayBookings.some((booking) => booking.sleepover),
        `${location.name} ${day.toDateString()} should include a sleepover`,
      );
      assert.ok(
        dayBookings.some((booking) => !booking.sleepover),
        `${location.name} ${day.toDateString()} should include a daytime shift`,
      );
    }
  }
});

/* Identical columns read as a wall rather than a roster, so staffing varies. */
test('days carry different numbers of bookings across the week', () => {
  const weekStart = startOfWeek(startOfDay(new Date()));

  for (const location of LOCATIONS) {
    const data = getLocationData(location.id);
    const counts = new Set(
      Array.from({ length: 7 }, (_, i) =>
        data.bookings.filter((booking) => isSameDay(booking.start, addDays(weekStart, i))).length),
    );
    assert.ok(
      counts.size >= 2,
      `${location.name} has ${[...counts]} bookings every day this week; the grid reads as a wall`,
    );
  }
});

test('each location has at most three requested bookings in any week', () => {
  for (const location of LOCATIONS) {
    const data = getLocationData(location.id);
    const byWeek = new Map<string, typeof data.bookings>();

    for (const booking of data.bookings) {
      const key = startOfWeek(booking.start).toISOString();
      const week = byWeek.get(key) ?? [];
      week.push(booking);
      byWeek.set(key, week);
    }

    for (const [week, list] of byWeek) {
      const requested = list.filter((booking) => booking.status === 'requested');
      assert.ok(
        requested.length <= 3,
        `${location.name} week of ${week} has ${requested.length} requested bookings; the cap is 3`,
      );
    }
  }
});

test('this week still shows some requested bookings', () => {
  const weekStart = startOfWeek(startOfDay(new Date()));
  const weekEnd = addDays(weekStart, 7);

  for (const location of LOCATIONS) {
    const requested = getLocationData(location.id).bookings.filter(
      (booking) =>
        booking.status === 'requested' &&
        booking.start >= weekStart &&
        booking.start < weekEnd,
    );
    assert.ok(
      requested.length >= 1 && requested.length <= 3,
      `${location.name} this week has ${requested.length} requested bookings; want 1–3`,
    );
  }
});

test('a week fits the dashboard grid, so no day hides cards behind the expander', () => {
  const week = readFileSync(
    new URL('../src/pages/dashboard/BookingsWeek.tsx', import.meta.url),
    'utf8',
  );
  const cap = Number(/const COLLAPSED_BOOKINGS_PER_DAY = (\d+);/.exec(week)![1]);
  const weekStart = startOfWeek(startOfDay(new Date()));

  for (const location of LOCATIONS) {
    const data = getLocationData(location.id);
    for (let i = 0; i < 7; i += 1) {
      const day = addDays(weekStart, i);
      const dayBookings = data.bookings.filter((booking) => isSameDay(booking.start, day));
      assert.ok(
        dayBookings.length <= cap,
        `${location.name} ${day.toDateString()} has ${dayBookings.length} bookings, over the ${cap} the grid shows; the sleepover would be hidden`,
      );
    }
  }
});

test('a worker is not booked twice on the same day', () => {
  const data = getLocationData('dee-why-1');
  const keys = new Set<string>();

  for (const booking of data.bookings) {
    const key = `${booking.workerName}-${booking.start.toDateString()}`;
    assert.equal(keys.has(key), false, `${booking.workerName} appears twice on ${booking.start.toDateString()}`);
    keys.add(key);
  }
});
