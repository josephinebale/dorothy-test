import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

/* A control earns an icon or a label, not both. Two things are exempt because
   they are not decoration: an avatar is identity, and a chevron says that a
   menu opens. */

test('tier one utility controls are icon and badge, with no text label', () => {
  const header = source('../src/components/AppHeader.tsx');
  const [identityTier] = header.split('app-header-nav-row');

  assert.match(identityTier, /<MessageSquare className="h-5 w-5"/);
  assert.match(identityTier, /<Bell className="h-5 w-5"/);
  assert.doesNotMatch(identityTier, /<span>Messages<\/span>|<span>Notifications<\/span>/);
  assert.match(identityTier, /<Badge count=\{unreadMessages\}/);
  assert.match(identityTier, /<Badge count=\{unreadNotifications\}/);
});

test('the account trigger keeps its avatar and one rotating menu chevron', () => {
  const header = source('../src/components/AppHeader.tsx');

  assert.match(header, /<Avatar name=\{MANAGER_NAME\} size="md" \/>/);
  assert.match(header, /<ChevronDown[\s\S]*?className=\{`h-5 w-5/);
  assert.match(header, /accountMenu\.open \? 'rotate-180'/);
  assert.doesNotMatch(header, /ChevronUp/);
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

test('dashboard row actions are icons with accessible labels, not both', () => {
  const panel = source('../src/pages/dashboard/TeamPanel.tsx');

  assert.match(panel, /<MessageSquare className="h-5 w-5"/);
  assert.match(panel, /<Calendar className="h-5 w-5"/);
  assert.doesNotMatch(panel, />\s*Message\s*</);
  assert.doesNotMatch(panel, />\s*Book\s*</);
  assert.match(panel, /aria-label=\{`Message \$\{worker\.name\}`\}/);
  assert.match(panel, /aria-label=\{`Book \$\{worker\.name\}`\}/);
  assert.match(panel, /data-tooltip=\{`Message \$\{worker\.name\}`\}/);
  assert.match(panel, /data-tooltip=\{`Book \$\{worker\.name\}`\}/);
});

test('dashboard worker rows keep actions on the avatar line, aligned right', () => {
  const panel = source('../src/pages/dashboard/TeamPanel.tsx');
  const row = panel.slice(panel.indexOf('<li'), panel.indexOf('</li>'));

  assert.match(row, /ui-inset-row ui-target-row flex items-center gap-3/);
  assert.match(row, /ui-target-row__action ml-auto flex shrink-0 items-center gap-1/);
  assert.doesNotMatch(row, /mt-3/);
  assert.doesNotMatch(row, /size="small"/);
});
