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

test('the account control shows a medium photo avatar without a text label', () => {
  const header = source('../src/components/AppHeader.tsx');
  const avatars = source('../src/data/avatars.ts');

  assert.match(header, /<Avatar name=\{MANAGER_NAME\} size="md" \/>/);
  assert.doesNotMatch(header, />Helen<\/span>/);
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

test('the account and location triggers share one centred treatment', () => {
  const header = source('../src/components/AppHeader.tsx');
  const switcher = source('../src/components/LocationSwitcher.tsx');
  const css = source('../src/index.css');
  const avatar = source('../src/components/Avatar.tsx');

  assert.match(
    css,
    /\.header-menu-trigger \{[\s\S]*?height: 2\.25rem;[\s\S]*?align-items: center;[\s\S]*?gap: var\(--space-3\);/,
  );
  assert.match(header, /className="header-menu-trigger -mr-4"/);
  assert.match(switcher, /className="header-menu-trigger location-switcher-trigger/);
  assert.doesNotMatch(header, /items-baseline/);
  assert.doesNotMatch(avatar, /\balign-(?:middle|baseline|top|bottom|text-\S+)\b/);
});

test('the identity tier is 56px and the nav tier is 48px', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');
  const row = header.match(/className="app-header-row[^"]*"/)?.[0] ?? '';

  assert.match(css, /--header-identity-height:\s*3\.5rem;/);
  assert.match(css, /--header-nav-height:\s*3rem;/);
  assert.match(css, /\.app-header-row\s*\{\s*height: var\(--header-identity-height\);/);
  assert.match(header, /height: 'var\(--header-identity-height\)'/);
  assert.match(row, /app-header-row/);
  assert.doesNotMatch(row, /\bpy-\d/);
});

test('the header scrolls with the page rather than staying pinned', () => {
  const header = source('../src/components/AppHeader.tsx');
  const request = source('../src/pages/BookingRequest.tsx');

  assert.match(header, /<header className="app-header z-20">/);
  assert.doesNotMatch(header, /sticky top-0/);
  /* Summary used to sit 128px down to clear a pinned header. */
  assert.match(request, /<Card as="aside" className="sticky top-8 p-5">/);
  assert.doesNotMatch(request, /sticky top-32/);
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

test('nav labels carry weight, and the active one is bold with a 3px underline', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(header, /main-nav-link--active font-bold text-text/);
  assert.match(header, /font-medium text-text-strong/);
  assert.match(css, /\.main-nav-link--active\s*\{\s*border-bottom-color: var\(--color-text\);/);
  assert.match(css, /\.main-nav-link \{[\s\S]*?border-bottom: 3px solid transparent;/);
});

test('badges are 18px square so two digits keep air around them', () => {
  const css = source('../src/index.css');

  assert.match(css, /\.ui-badge[\s\S]*?min-width: 1\.125rem;/);
  assert.match(css, /\.ui-badge[\s\S]*?height: 1\.125rem;/);
  assert.match(css, /\.ui-badge[\s\S]*?padding-inline: calc\(var\(--space-1\) \* 1\.5\);/);
  assert.match(css, /\.ui-badge[\s\S]*?font-variant-numeric: tabular-nums;/);
  assert.match(css, /\.header-utility \.ui-badge[\s\S]*?position: absolute;/);
});

/* An inline-flex control inside a block wrapper sits on a text baseline, which
   adds descender space below it and pushes the whole control off centre. */
test('the account control is a flex child so no baseline gap offsets it', () => {
  const header = source('../src/components/AppHeader.tsx');

  assert.match(header, /<div className="relative flex items-center">/);
});

test('tier one has one divider between the logo and location switcher', () => {
  const header = source('../src/components/AppHeader.tsx');
  const [identityTier] = header.split('app-header-nav-row');

  assert.equal(identityTier.match(/h-6 w-px/g)?.length, 1);
  assert.match(identityTier, /<Logo \/>[\s\S]*?h-6 w-px[\s\S]*?<LocationSwitcher/);
});

test('badge digits sit on a zero line-height flex centre', () => {
  const badge = source('../src/components/ui/Badge.tsx');

  assert.match(
    badge,
    /className="ui-badge ui-badge--attention inline-flex items-center justify-center leading-none"/,
  );
});

test('the location switcher sits in tier one without a negative margin', () => {
  const header = source('../src/components/AppHeader.tsx');
  const switcher = source('../src/components/LocationSwitcher.tsx');
  const [identityTier, navTier] = header.split('app-header-nav-row');

  assert.match(identityTier, /<LocationSwitcher/);
  assert.doesNotMatch(navTier, /<LocationSwitcher|h-6 w-px/);
  assert.doesNotMatch(switcher, /-ml-2/);
});

/**
 * The pull-back has to match whatever the control actually pads by. `.ui-button--default`
 * is unlayered, so it beats a Tailwind `px-*` utility: the real inset is --space-4.
 */
test('the account trigger ends on the edge the logo starts from', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(css, /\.ui-button--default \{[\s\S]*?padding: 0 var\(--space-4\);/);
  assert.match(header, /className="header-menu-trigger -mr-4"/);
});

test('every nav link fills the row so one underline serves them all', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(header, /<nav className="flex h-full w-max items-stretch"/);
  assert.match(header, /main-nav-link h-full shrink-0 text-sm/);
  assert.match(
    css,
    /\.main-nav-link \{[\s\S]*?align-items: center;[\s\S]*?border-bottom: 3px solid transparent;/,
  );
});

test('hovering a nav link fills the whole block in an existing quiet surface', () => {
  const css = source('../src/index.css');

  assert.match(css, /\.main-nav-link \{[\s\S]*?padding-inline: var\(--space-3\);/);
  assert.match(css, /\.main-nav-link:hover \{\s*background: var\(--color-info-surface\);\s*\}/);
  assert.doesNotMatch(css, /\.main-nav-link:hover \{[^}]*border-bottom-color/);
});

test('the nav block starts on the same line as the lockup and page heading', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  // No pull-left on the nav, and no per-item padding exception, so every hover
  // fill and underline is the same shape and the first one starts on the line.
  assert.doesNotMatch(header, /<nav className="-ml-3/);
  assert.doesNotMatch(css, /\.main-nav-link:first-child/);
});

test('the footer centres its compact logo against the link line boxes', () => {
  const footer = source('../src/components/AppFooter.tsx');
  const logo = source('../src/components/Logo.tsx');

  assert.match(footer, /flex max-w-page flex-wrap items-center/);
  assert.match(logo, /className=\{compact \? 'block w-auto' : 'block h-6 w-auto'\}/);
  assert.match(logo, /const height = compact \? 18 : 24;/);
});
