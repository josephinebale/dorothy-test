import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('location markers use the medium square token without a border or ring', () => {
  const marker = source('../src/components/LocationMarker.tsx');

  assert.match(marker, /\bh-9 w-9\b/);
  assert.match(marker, /\brounded-lg\b/);
  assert.doesNotMatch(marker, /\b(?:border|ring)(?:-\S+)?\b/);
});

test('the account control shows Helen with a medium photo avatar', () => {
  const header = source('../src/components/AppHeader.tsx');
  const avatars = source('../src/data/avatars.ts');

  assert.match(header, /<Avatar name=\{MANAGER_NAME\} size="md" \/>/);
  assert.match(header, /<span className="max-w-40 truncate">Helen<\/span>/);
  assert.match(avatars, /import helenDawson from '\.\.\/assets\/avatars\/helen-dawson\.jpg';/);
  assert.match(avatars, /'Helen Dawson': helenDawson/);
});

test('the account trigger is 36px tall with no extra vertical padding', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');
  const avatar = source('../src/components/Avatar.tsx');

  assert.match(header, /<Avatar name=\{MANAGER_NAME\} size="md" \/>/);
  assert.match(header, /size="default"/);
  assert.match(css, /\.ui-button--default \{\s*height: 2\.25rem;\s*padding: 0 var\(--space-4\);/);
  assert.match(avatar, /\bblock shrink-0\b/);
});

test('Helen and the account avatar share a flex centre, not a text baseline', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');
  const avatar = source('../src/components/Avatar.tsx');

  assert.match(
    css,
    /\.ui-button \{[\s\S]*?display: inline-flex;[\s\S]*?align-items: center;[\s\S]*?gap: var\(--space-2\);/,
  );
  assert.doesNotMatch(header, /items-baseline/);
  assert.doesNotMatch(avatar, /\balign-(?:middle|baseline|top|bottom|text-\S+)\b/);
});

test('the identity row is locked to the 48px token with no vertical padding', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');
  const row = header.match(/className="app-header-row[^"]*"/)?.[0] ?? '';

  assert.match(css, /--header-identity-height:\s*3rem;/);
  assert.match(css, /\.app-header-row\s*\{\s*height: var\(--header-identity-height\);/);
  assert.match(header, /height: 'var\(--header-identity-height\)'/);
  assert.match(row, /app-header-row/);
  assert.doesNotMatch(row, /\bpy-\d/);
});

test('header and footer logos keep their distinct compact sizes', () => {
  const logo = source('../src/components/Logo.tsx');

  assert.match(logo, /const height = compact \? 18 : 24;/);
});

test('tier one explicitly centres the block logo between shared edges', () => {
  const header = source('../src/components/AppHeader.tsx');
  const logo = source('../src/components/Logo.tsx');

  assert.match(
    header,
    /app-header-row[^"]*\bflex\b[^"]*\bitems-center\b[^"]*\bjustify-between\b/,
  );
  assert.match(
    logo,
    /className=\{compact \? 'block w-auto' : 'block h-6 w-auto'\}/,
  );
});

test('active navigation is medium-weight with the brand underline', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(header, /main-nav-link--active font-medium/);
  assert.match(css, /\.main-nav-link--active\s*\{\s*border-bottom-color: var\(--color-brand\);/);
});

test('badges are 18px square so two digits keep air around them', () => {
  const css = source('../src/index.css');

  assert.match(css, /\.ui-badge[\s\S]*?min-width: 1\.125rem;/);
  assert.match(css, /\.ui-badge[\s\S]*?height: 1\.125rem;/);
  assert.match(css, /\.ui-badge[\s\S]*?padding-inline: var\(--space-1\);/);
});

/* An inline-flex control inside a block wrapper sits on a text baseline, which
   adds descender space below it and pushes the whole control off centre. */
test('the account control is a flex child so no baseline gap offsets it', () => {
  const header = source('../src/components/AppHeader.tsx');

  assert.match(header, /<div className="relative flex items-center">/);
});

test('tier one carries no divider before the account control', () => {
  const header = source('../src/components/AppHeader.tsx');
  const [identityTier] = header.split('app-header-nav-row');

  assert.doesNotMatch(identityTier, /w-px/);
});

test('badge digits sit on a zero line-height flex centre', () => {
  const badge = source('../src/components/ui/Badge.tsx');

  assert.match(
    badge,
    /className="ui-badge ui-badge--attention inline-flex items-center justify-center leading-none"/,
  );
});

test('the location switcher face aligns with the tier one left edge', () => {
  const switcher = source('../src/components/LocationSwitcher.tsx');

  assert.match(
    switcher,
    /className="location-switcher-trigger -ml-2 focus-visible:outline-2/,
  );
});

/**
 * The pull-back has to match whatever the control actually pads by. `.ui-button--default`
 * is unlayered, so it beats a Tailwind `px-*` utility: the real inset is --space-4.
 */
test('the account trigger ends on the edge the logo starts from', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(css, /\.ui-button--default \{[\s\S]*?padding: 0 var\(--space-4\);/);
  assert.match(header, /className="-mr-4"/);
});

test('every nav link fills the row so one underline serves them all', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(header, /<nav className="flex h-full w-max items-stretch gap-8"/);
  assert.match(header, /main-nav-link h-full shrink-0 text-sm/);
  assert.match(
    css,
    /\.main-nav-link \{[\s\S]*?align-items: center;[\s\S]*?border-bottom: 2px solid transparent;/,
  );
});

test('the footer centres its compact logo against the link line boxes', () => {
  const footer = source('../src/components/AppFooter.tsx');
  const logo = source('../src/components/Logo.tsx');

  assert.match(footer, /flex max-w-page flex-wrap items-center/);
  assert.match(logo, /className=\{compact \? 'block w-auto' : 'block h-6 w-auto'\}/);
  assert.match(logo, /const height = compact \? 18 : 24;/);
});
