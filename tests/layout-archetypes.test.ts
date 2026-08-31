import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
const dashboard = readFileSync(
  new URL('../src/pages/Dashboard.tsx', import.meta.url),
  'utf8',
);
const bookings = readFileSync(
  new URL('../src/pages/Bookings.tsx', import.meta.url),
  'utf8',
);
const messages = readFileSync(
  new URL('../src/pages/Messages.tsx', import.meta.url),
  'utf8',
);
const settings = readFileSync(
  new URL('../src/pages/Settings.tsx', import.meta.url),
  'utf8',
);
const team = readFileSync(
  new URL('../src/pages/Team.tsx', import.meta.url),
  'utf8',
);

test('all split layouts share one 260px narrow-column token', () => {
  assert.match(css, /--narrow-column-width:\s*16\.25rem/);
  assert.doesNotMatch(css, /--sidebar-(?:bookings|team|settings)-width/);
  assert.doesNotMatch(css, /--messages-list-width/);
});

test('pages declare their distinct layout archetype', () => {
  assert.match(bookings, /layout-rail-content/);
  assert.match(settings, /layout-rail-content/);
  assert.match(messages, /layout-master-detail/);
  assert.match(dashboard, /layout-content-aside/);
});

test('Team keeps a narrow measure without centring its left edge', () => {
  assert.match(team, /className="max-w-content"/);
  assert.doesNotMatch(team, /mx-auto max-w-content/);
});
