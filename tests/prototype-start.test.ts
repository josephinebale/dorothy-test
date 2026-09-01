import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('a simplified login screen appears before location selection', () => {
  const app = source('../src/App.tsx');
  const start = source('../src/pages/PrototypeStart.tsx');

  assert.match(app, /const \[started, setStarted\] = useState\(readPrototypeStarted\)/);
  assert.match(app, /if \(!started\)/);
  assert.match(app, /<PrototypeStart\s+onStart=/);
  assert.ok(app.indexOf('if (!started)') < app.indexOf('if (!locationId)'));

  assert.match(start, /<Logo/);
  /* A login card is narrower than a page's content measure. */
  assert.match(start, /<Card className="w-full max-w-md /);
  assert.match(start, />\s*Log in to Hireup\s*</);
  assert.match(start, />\s*Login\s*</);
  /* It reads as a login, but nothing is collected: no fields to type into. */
  assert.doesNotMatch(start, /<input|type="email"|type="password"/);
  assert.doesNotMatch(start, /Start prototype/);
});

test('starting is remembered, while restart clears it', () => {
  const app = source('../src/App.tsx');
  const session = source('../src/lib/session.ts');

  assert.match(session, /const PROTOTYPE_STARTED_KEY = 'hm\.prototypeStarted'/);
  assert.match(session, /export function readPrototypeStarted/);
  assert.match(session, /export function writePrototypeStarted/);
  assert.match(session, /clearSession[\s\S]*remove\(PROTOTYPE_STARTED_KEY\)/);

  assert.match(app, /writePrototypeStarted\(true\)/);
  assert.match(app, /setStarted\(true\)/);
  assert.match(app, /const restart =[\s\S]*setStarted\(false\)/);
});
