import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { workerIdFromPath, workerProfilePath } from '../src/lib/pageContent.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('worker profile routes use the worker id under Team', () => {
  assert.equal(workerProfilePath('dee-why-1-worker-5'), '/team/dee-why-1-worker-5');
  assert.equal(workerIdFromPath('/team/dee-why-1-worker-5'), 'dee-why-1-worker-5');
  assert.equal(workerIdFromPath('/team'), null);
});

test('the app renders a worker profile from the current location team', () => {
  const app = source('../src/App.tsx');

  assert.match(app, /import \{ WorkerProfile \}/);
  assert.match(app, /path\.startsWith\(`\$\{TEAM_ROUTE\}\/`\)/);
  assert.match(app, /<WorkerProfile data=\{visibleData\} workerId=\{workerIdFromPath\(path\)\}/);
});

test('the worker profile adapts the reference into existing product primitives', () => {
  const profile = source('../src/pages/WorkerProfile.tsx');

  assert.match(profile, /<PageHeading/);
  assert.match(profile, /layout-rail-content/);
  assert.match(profile, /<Avatar name=\{worker\.name\}/);
  assert.match(profile, /About/);
  assert.match(profile, /Availability/);
  assert.match(profile, /Support offered/);
  assert.match(profile, /Verified documents/);
  assert.match(profile, /Qualifications/);
  assert.match(profile, /Work history/);
  assert.match(profile, /Worker not found/);
});

test('safe worker-name links open profiles without replacing selection controls', () => {
  const team = source('../src/pages/Team.tsx');
  const dashboardTeam = source('../src/pages/dashboard/TeamPanel.tsx');
  const bookings = source('../src/pages/Bookings.tsx');
  const messages = source('../src/pages/Messages.tsx');

  assert.match(team, /href=\{href\(workerProfilePath\(worker\.id\)\)\}/);
  assert.match(dashboardTeam, /href=\{href\(workerProfilePath\(worker\.id\)\)\}/);
  assert.match(bookings, /workerProfilePath\(worker\.id\)/);
  assert.match(messages, /href=\{href\(workerProfilePath\(selected\.id\)\)\}/);
  assert.match(messages, /selectConversation\(conversation\)/);
});
