import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

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
