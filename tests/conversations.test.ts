import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  buildAllConversations,
  totalUnreadMessages,
  unreadMessagesFromDescription,
  unreadWorkerNamesForLocation,
} from '../src/data/conversations.ts';
import { LOCATIONS, getLocationData } from '../src/data/locations.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('Messages is universal: every location contributes conversations', () => {
  const conversations = buildAllConversations();
  const locationIds = new Set(conversations.map((item) => item.locationId));

  for (const location of LOCATIONS) {
    assert.ok(locationIds.has(location.id), `missing ${location.id}`);
    const expected = getLocationData(location.id).workers.length;
    const actual = conversations.filter((item) => item.locationId === location.id).length;
    assert.equal(actual, expected);
  }

  const ids = conversations.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('each conversation names the location the worker is affiliated with', () => {
  for (const conversation of buildAllConversations()) {
    const location = LOCATIONS.find((item) => item.id === conversation.locationId);
    assert.ok(location);
    assert.equal(conversation.locationName, location.name);
  }
});

test('the list reads newest first across locations, not grouped by location', () => {
  const conversations = buildAllConversations();
  const times = conversations.map((item) => item.at.getTime());

  assert.deepEqual(times, [...times].sort((a, b) => b - a));

  const firstFive = conversations.slice(0, 5).map((item) => item.locationId);
  assert.ok(new Set(firstFive).size > 1, 'the top of the list should mix locations');
});

test('unread message copy names the workers with unread threads', () => {
  for (const location of LOCATIONS) {
    const names = unreadWorkerNamesForLocation(location.id);
    const expectedCount = getLocationData(location.id).unreadMessages;

    assert.equal(names.length, expectedCount);
    assert.equal(new Set(names).size, names.length);

    const description = unreadMessagesFromDescription(location.id);
    for (const name of names) {
      assert.match(description, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
    assert.match(description, new RegExp(`on the ${location.name} team`));
    assert.doesNotMatch(description, /workers at/);
    assert.doesNotMatch(description, / at /);
  }
});

test('the unread total covers all locations, not just the selected one', () => {
  const expected = LOCATIONS.reduce(
    (sum, location) => sum + getLocationData(location.id).unreadMessages,
    0,
  );

  assert.equal(totalUnreadMessages(), expected);
  assert.equal(
    buildAllConversations().reduce((sum, item) => sum + item.unread, 0),
    expected,
  );
});

test('the list shows each location and can be searched by it', () => {
  const messages = source('../src/pages/Messages.tsx');

  assert.match(messages, /buildAllConversations\(\)/);
  assert.match(messages, /\{conversation\.locationName\}/);
  assert.match(messages, /conversation\.locationName\.toLowerCase\(\)\.includes\(needle\)/);
  assert.match(messages, /\{selected\.locationName\}/);
});

test('the header message count is the universal total', () => {
  const app = source('../src/App.tsx');

  assert.match(app, /unreadMessages=\{unreadOverride \?\? totalUnreadMessages\(\)\}/);
});

test('a worker profile resolves from any location, since Messages spans them', () => {
  const profile = source('../src/pages/WorkerProfile.tsx');

  assert.match(profile, /findWorker/);
  assert.match(profile, /\$\{found\.location\.name\} team/);
  assert.doesNotMatch(profile, /data\.location\.name/);
});
