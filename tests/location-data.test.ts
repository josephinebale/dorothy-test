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

test('this week is covered like 24/7 SIL rather than a sparse few shifts', () => {
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today);
  const data = getLocationData('dee-why-1');

  for (let i = 0; i < 7; i += 1) {
    const day = addDays(weekStart, i);
    const dayBookings = data.bookings.filter((booking) => isSameDay(booking.start, day));
    assert.ok(
      dayBookings.length >= 4,
      `${day.toDateString()} has ${dayBookings.length} bookings; a 24/7 SIL day usually has overlapping day staff plus overnight`,
    );
    assert.ok(
      dayBookings.some((booking) => booking.sleepover),
      `${day.toDateString()} should include a sleepover`,
    );
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
