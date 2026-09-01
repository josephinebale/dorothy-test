import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACCOUNT_SECTIONS,
  CAN_EDIT_ORGANISATION_DETAILS,
  HOUSE_SECTIONS,
  MANAGER_NAME,
  ORGANISATION_NAME,
  ORGANISATION_SECTIONS,
  PERSONAL_MENU_ITEMS,
  ROUTES,
  menuIndexAfterKey,
  sectionFromPath,
} from '../src/lib/informationArchitecture.ts';

test('settings sections are split by scope without changing existing labels', () => {
  assert.deepEqual(HOUSE_SECTIONS.map(({ label }) => label), [
    'Support worker preferences',
    'Support areas',
    'Specialised support',
    'COVID-19 requirements',
    'Support plan',
    'Location name',
    'Location picture',
    'People',
  ]);
  assert.deepEqual(ORGANISATION_SECTIONS.map(({ label }) => label), [
    'Organisation details',
    'Financial details',
    'Documents',
    'People',
  ]);
  assert.deepEqual(ACCOUNT_SECTIONS.map(({ label }) => label), [
    'About you',
    'Profile picture',
    'Account',
    'Privacy',
    'Password',
  ]);
});

test('the account menu contains personal destinations only', () => {
  assert.deepEqual(PERSONAL_MENU_ITEMS, [
    { label: 'Profile', path: '/your-account/about-you' },
    { label: 'Account', path: '/your-account/account' },
    { label: 'Privacy', path: '/your-account/privacy' },
    { label: 'Password', path: '/your-account/password' },
  ]);
});

test('each settings scope has one route and a stable default section', () => {
  assert.deepEqual(ROUTES, {
    manageHouse: '/manage-house',
    organisationSettings: '/organisation-settings',
    yourAccount: '/your-account',
  });
  assert.equal(sectionFromPath('/manage-house', HOUSE_SECTIONS), 'preferences');
  assert.equal(sectionFromPath('/manage-house/people', HOUSE_SECTIONS), 'people');
  assert.equal(sectionFromPath('/your-account/privacy', ACCOUNT_SECTIONS), 'privacy');
});

test('organisation editing is controlled by one flag', () => {
  assert.equal(CAN_EDIT_ORGANISATION_DETAILS, false);
  assert.equal(ORGANISATION_NAME, 'Cerebral Palsy Alliance');
  assert.equal(MANAGER_NAME, 'Helen Dawson');
});

test('financial details reuse the shared organisation name', () => {
  const settingsSource = readFileSync(
    new URL('../src/pages/Settings.tsx', import.meta.url),
    'utf8',
  );
  assert.match(settingsSource, /useState\(ORGANISATION_NAME\)/);
  assert.doesNotMatch(settingsSource, /Hireup Demonstration Co/);
});

test('arrow keys wrap through menu items', () => {
  assert.equal(menuIndexAfterKey(0, 'ArrowDown', 3), 1);
  assert.equal(menuIndexAfterKey(2, 'ArrowDown', 3), 0);
  assert.equal(menuIndexAfterKey(0, 'ArrowUp', 3), 2);
  assert.equal(menuIndexAfterKey(1, 'Home', 3), 0);
  assert.equal(menuIndexAfterKey(1, 'End', 3), 2);
  assert.equal(menuIndexAfterKey(1, 'Escape', 3), null);
});
