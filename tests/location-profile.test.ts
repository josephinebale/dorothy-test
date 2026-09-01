import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { LOCATIONS } from '../src/data/locations.ts';
import {
  createDefaultLocationProfile,
  parseLocationProfiles,
} from '../src/lib/locationProfiles.ts';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('each location gets safe worker-facing profile defaults', () => {
  const location = LOCATIONS[0];
  const profile = createDefaultLocationProfile(location);

  assert.equal(profile.locationId, location.id);
  assert.match(profile.about, new RegExp(location.name));
  assert.ok(profile.supportPlaces.length > 0);
  assert.ok(profile.supportNeeds.length > 0);
  assert.ok(profile.supportRequired.length > 0);
  assert.ok(profile.safety.length > 0);
});

test('saved profiles merge with defaults and stay scoped by location', () => {
  const profiles = parseLocationProfiles(
    JSON.stringify({
      'dee-why-1': {
        locationId: 'dee-why-1',
        about: 'A saved introduction.',
        supportPlaces: ['In the community'],
        supportNeeds: ['Community access'],
        supportRequired: ['Transport'],
        safety: 'Read the shift notes.',
      },
    }),
  );

  assert.equal(profiles['dee-why-1'].about, 'A saved introduction.');
  assert.equal(profiles['galston-1'], undefined);
});

test('Location settings includes one editable profile section', () => {
  const architecture = source('../src/lib/informationArchitecture.ts');
  const settings = source('../src/pages/Settings.tsx');
  const editor = source('../src/components/LocationProfileSettings.tsx');

  assert.match(architecture, /\{ id: 'profile', label: 'Location profile' \}/);
  assert.match(settings, /case 'profile':/);
  assert.match(settings, /<LocationProfileSettings data=\{data\} \/>/);
  assert.match(editor, /About this location/);
  assert.match(editor, /Where support may take place/);
  assert.match(editor, /People supported/);
  assert.match(editor, /Safety information/);
  assert.match(editor, /Support required/);
  assert.match(editor, /Save profile/);
  assert.match(editor, /Preview profile/);
  assert.match(editor, /writeLocationProfile/);
});

test('the preview route renders the saved worker-facing profile', () => {
  const app = source('../src/App.tsx');
  const preview = source('../src/pages/LocationProfilePreview.tsx');

  assert.match(app, /<LocationProfilePreview data=\{visibleData\} \/>/);
  assert.match(preview, /readLocationProfile\(data\.location\)/);
  assert.match(preview, /Location profile preview/);
  assert.match(preview, /Preview of what workers see/);
  assert.match(preview, /Edit profile/);
  assert.match(preview, /About this location/);
  assert.match(preview, /Support required/);
});
