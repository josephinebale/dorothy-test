import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

/* A control earns an icon or a label, not both. Two things are exempt because
   they are not decoration: an avatar is identity, and a chevron says that a
   menu opens. */

test('tier one utility controls are label and badge, with no leading icon', () => {
  const header = source('../src/components/AppHeader.tsx');
  const [identityTier] = header.split('app-header-nav-row');

  assert.doesNotMatch(identityTier, /<MessageCircle/);
  assert.doesNotMatch(identityTier, /<Bell/);
  assert.doesNotMatch(header, /\bMessageCircle,?\n|\bBell,?\n/);
});

test('the account trigger keeps its avatar and its menu chevron', () => {
  const header = source('../src/components/AppHeader.tsx');

  assert.match(header, /<Avatar name=\{MANAGER_NAME\} size="md" \/>/);
  assert.match(header, /<ChevronUp className="h-5 w-5/);
  assert.match(header, /<ChevronDown className="h-5 w-5/);
});

test('tier one controls share one height so their hover states align', () => {
  const header = source('../src/components/AppHeader.tsx');
  const [identityTier] = header.split('app-header-nav-row');

  assert.doesNotMatch(identityTier, /size="small"/);
});

test('the request booking action is a label without a plus icon', () => {
  const heading = source('../src/components/PageHeading.tsx');

  assert.doesNotMatch(heading, /<Plus/);
  assert.doesNotMatch(heading, /lucide-react/);
  assert.match(heading, /Request booking/);
});

test('dashboard row actions are labels without icons', () => {
  const panel = source('../src/pages/dashboard/TeamPanel.tsx');

  assert.doesNotMatch(panel, /<MessageCircle/);
  assert.doesNotMatch(panel, /<Calendar/);
  assert.doesNotMatch(panel, /lucide-react/);
});
