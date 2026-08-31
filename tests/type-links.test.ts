import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');

const css = read('../src/index.css');
const source = [
  read('../src/components/PageHeading.tsx'),
  read('../src/pages/Bookings.tsx'),
  read('../src/pages/Messages.tsx'),
  read('../src/pages/Notifications.tsx'),
  read('../src/pages/Team.tsx'),
  read('../src/pages/dashboard/BookingsWeek.tsx'),
  read('../src/pages/dashboard/NotificationStrip.tsx'),
  read('../src/pages/dashboard/TeamPanel.tsx'),
].join('\n');

test('type tokens expose only the five requested steps', () => {
  assert.match(css, /--text-xs:\s*0\.75rem/);
  assert.match(css, /--text-sm:\s*0\.875rem/);
  assert.match(css, /--text-md:\s*1rem/);
  assert.match(css, /--text-lg:\s*1\.25rem/);
  assert.match(css, /--text-xl:\s*1\.5rem/);
  assert.doesNotMatch(css, /--text-(?:body|subtitle|title):/);
  assert.doesNotMatch(source, /text-(?:body|subtitle|title)/);
});

test('whole-target rows use one stretched-link treatment', () => {
  assert.match(css, /\.ui-target-row/);
  assert.match(css, /\.ui-target-row__link::after/);
  assert.match(source, /ui-target-row/);
  assert.match(source, /ui-target-row__link/);
});

test('entity names are strong text rather than blue underlined text', () => {
  const entityRule = css.match(/\.ui-entity-link\s*\{([^}]+)\}/)?.[1] ?? '';
  assert.match(entityRule, /color:\s*var\(--color-text-strong\)/);
  assert.match(entityRule, /text-decoration:\s*none/);
});
