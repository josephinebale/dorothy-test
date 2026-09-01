import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('session stores the last location without dropping the older house key', () => {
  const source = readFileSync(new URL('../src/lib/session.ts', import.meta.url), 'utf8');
  assert.match(source, /hm\.lastLocationId/);
  assert.match(source, /hm\.lastHouseId/);
  assert.match(source, /export function readLastLocationId/);
  assert.doesNotMatch(source, /export function readLastHouseId/);
});
