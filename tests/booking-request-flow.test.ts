import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('the request booking route renders the three-step flow', () => {
  const app = source('../src/App.tsx');
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(app, /path === '\/request-booking'/);
  assert.match(flow, /Location, date and time/);
  assert.match(flow, /Details/);
  assert.match(flow, /Select workers/);
  assert.match(flow, /step === 1/);
  assert.match(flow, /step === 2/);
  assert.match(flow, /step === 3/);
});

test('the flow requires its essential fields before moving forward', () => {
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(flow, /<select[\s\S]*value=\{data\.location\.id\}/);
  assert.match(flow, /LOCATIONS\.map/);
  assert.doesNotMatch(flow, /Booking location/);
  assert.doesNotMatch(flow, /This comes from the location selected in the header/);
  assert.doesNotMatch(flow, /placeholder="For example, 120 Pacific Highway/);
  assert.match(flow, /draft\.date !== '' && durationHours\(draft\) > 0/);
  assert.match(flow, /draft\.description\.trim\(\) !== '' && draft\.supportPlansConfirmed/);
  assert.match(flow, /draft\.selectedWorkerIds\.length > 0/);
  assert.match(flow, /draft\.selectedWorkerIds\.length >= 10/);
});

test('worker selection comes from the current location team', () => {
  const app = source('../src/App.tsx');
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(app, /<BookingRequest[\s\S]*onSelectLocation=\{selectLocation\}/);
  assert.match(flow, /\[\.\.\.data\.workers\]\.sort/);
  assert.match(flow, /workers in the \$\{data\.location\.name\} team/);
});

test('submitting opens a requested booking detail screen', () => {
  const app = source('../src/App.tsx');
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(app, /path\.startsWith\('\/bookings\/request\/'\)/);
  assert.match(app, /createdBookings/);
  assert.match(app, /bookings: \[\.\.\.createdForLocation, \.\.\.data\.bookings\]/);
  assert.match(flow, /Requested booking/);
  assert.match(flow, /Booking was requested/);
  assert.match(flow, /Waiting for a worker to accept this booking request/);
  assert.match(flow, /onCreateBooking\(newBooking\)/);
  assert.match(flow, /navigate\(`\/bookings\/request\/\$\{newBooking\.id\}`\)/);
});

test('requested booking cards link to their detail screens', () => {
  const bookings = source('../src/pages/Bookings.tsx');

  assert.match(
    bookings,
    /booking\.status === 'requested'\s*\? href\(`\/bookings\/request\/\$\{booking\.id\}`\)/,
  );
});

test('every dashboard shift opens its matching booking detail', () => {
  const app = source('../src/App.tsx');
  const week = source('../src/pages/dashboard/BookingsWeek.tsx');
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(week, /href=\{href\(bookingDetailPath\(booking\.id\)\)\}/);
  assert.match(week, /aria-label=\{`Open booking for \$\{booking\.workerName\}`\}/);
  assert.match(app, /path\.startsWith\(BOOKING_DETAIL_ROUTE\)/);
  assert.match(flow, /bookingIdFromDetailPath\(path\)/);
  assert.match(flow, /booking\.status === 'requested'/);
  assert.match(flow, /booking\?\.status === 'confirmed'/);
  assert.match(flow, /'Confirmed booking'/);
  assert.match(flow, /'Completed booking'/);
});

test('Bookings remains active throughout request creation and detail routes', () => {
  const header = source('../src/components/AppHeader.tsx');

  assert.match(header, /item\.path === '\/bookings'/);
  assert.match(header, /path === '\/request-booking'/);
  assert.match(header, /path\.startsWith\('\/bookings\/request\/'\)/);
  assert.match(header, /path\.startsWith\(BOOKING_DETAIL_ROUTE\)/);
});

test('the booking request layout includes empty, error, and summary states', () => {
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(flow, /role="alert"/);
  assert.match(flow, /No team members are available/);
  assert.match(flow, /BookingRequestSummary/);
  assert.match(flow, /Pricing estimate/);
  assert.match(flow, /Next step: \{step === 1 \? 'Details' : 'Select workers'\}/);
  assert.doesNotMatch(flow, /Ready to send/);
});

test('the richer worker list is driven from outside the page, not a hidden hotspot', () => {
  const flow = source('../src/pages/BookingRequest.tsx');
  const app = source('../src/App.tsx');

  assert.match(flow, /workerDetail: boolean/);
  assert.match(app, /const \[pageVariant, setPageVariant\] = useState\(false\)/);
  assert.match(app, /workerDetail=\{pageVariant\}/);
  /* The step label is plain text again. */
  assert.doesNotMatch(flow, /onClick=\{onToggleWorkerDetail\}/);
  assert.doesNotMatch(flow, /useState\(false\);\s*\/\* Held here/);
});

test('the revealed worker list adds place, team, and training', () => {
  const flow = source('../src/pages/BookingRequest.tsx');

  assert.match(flow, /Based in \{detail\.suburb\}, over 10km away/);
  assert.match(flow, /\{data\.location\.name\} team/);
  assert.match(flow, /Trained in \{detail\.training\.join\(', '\)\}/);
  assert.doesNotMatch(flow, /Show more|Show less|expandedWorkerIds|toggleExpanded/);
  assert.match(flow, /worker\$\{selectedNames\.length === 1 \? '' : 's'\} selected: /);
  assert.match(flow, /Select up to 10 workers\./);
});

test('unavailable workers keep a readable booked-at-this-time tag', () => {
  const flow = source('../src/pages/BookingRequest.tsx');
  const row = flow.slice(
    flow.indexOf('const unavailable = index === 5'),
    flow.indexOf('showErrors && draft.selectedWorkerIds.length === 0'),
  );

  assert.match(row, /<Tag tone="neutral">Booked at this time<\/Tag>/);
  assert.doesNotMatch(row, /opacity-50/);
  assert.match(row, /unavailable \? 'cursor-not-allowed text-text-secondary'/);
});
