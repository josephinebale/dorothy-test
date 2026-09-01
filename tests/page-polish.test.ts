import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('Bookings separates navigation and filters with space instead of a redundant line', () => {
  const bookings = source('../src/pages/Bookings.tsx');
  const filterStart = bookings.indexOf('<Card as="section"');
  const beforeFilter = bookings.slice(Math.max(0, filterStart - 160), filterStart);

  assert.doesNotMatch(beforeFilter, /border-t/);
  assert.doesNotMatch(beforeFilter, /pt-4/);
});

test('booking prices use a neutral tag because price is information, not status', () => {
  const bookings = source('../src/pages/Bookings.tsx');
  const price = bookings.slice(bookings.indexOf('<Tag tone='), bookings.indexOf('<Tag tone=') + 140);

  assert.match(price, /<Tag tone="neutral"/);
});

test('settings and bookings use the same quiet active rail treatment', () => {
  const settings = source('../src/pages/Settings.tsx');

  assert.match(settings, /border-l-2 px-3 py-2/);
  assert.match(settings, /border-brand bg-info-surface font-medium text-text/);
  assert.doesNotMatch(settings, /border-l-4/);
});

test('booking detail sections use one 24px gap without a redundant divider', () => {
  const request = source('../src/pages/BookingRequest.tsx');
  const supportDetails = request.slice(
    request.indexOf('>Support details</h2>') - 100,
    request.indexOf('>Support details</h2>'),
  );

  assert.match(supportDetails, /className="mt-6"/);
  assert.doesNotMatch(supportDetails, /border-t|pt-5/);
});
