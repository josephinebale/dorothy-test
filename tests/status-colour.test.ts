import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

/* Confirmed is the expected state of almost every booking, so colouring it
   signals nothing while filling the week grid. Colour is reserved for the
   exception that wants a decision. */

test('only a booking awaiting a decision tints its card', () => {
  const week = source('../src/pages/dashboard/BookingsWeek.tsx');
  const tones = week.slice(week.indexOf('CARD_TONES'), week.indexOf('COLLAPSED_BOOKINGS_PER_DAY'));

  assert.match(tones, /confirmed: 'default'/);
  assert.match(tones, /requested: 'pending'/);
  assert.match(tones, /ended: 'default'/);
});

test('a solid pill means a decision is waiting, a tinted pill only informs', () => {
  const pill = source('../src/components/StatusPill.tsx');

  assert.match(pill, /confirmed: 'bg-success-surface text-success'/);
  assert.match(pill, /requested: 'bg-pending text-surface'/);
  assert.match(pill, /ended: 'bg-neutral-surface text-neutral'/);
});
