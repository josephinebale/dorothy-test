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

test('header and footer logos keep their distinct compact sizes', () => {
  const logo = source('../src/components/Logo.tsx');

  assert.match(logo, /const height = compact \? 18 : 24;/);
});

test('active navigation is medium-weight with the brand underline', () => {
  const header = source('../src/components/AppHeader.tsx');
  const css = source('../src/index.css');

  assert.match(header, /main-nav-link--active font-medium/);
  assert.match(css, /\.main-nav-link--active\s*\{\s*border-bottom-color: var\(--color-brand\);/);
});

test('badges are at least 14px square and widen with horizontal padding', () => {
  const css = source('../src/index.css');

  assert.match(css, /\.ui-badge[\s\S]*?min-width: 0\.875rem;/);
  assert.match(css, /\.ui-badge[\s\S]*?height: 0\.875rem;/);
  assert.match(css, /\.ui-badge[\s\S]*?padding-inline: calc\(var\(--space-1\) \/ 2\);/);
});
