import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const SRC = new URL('../src/', import.meta.url);
const ICON_SIZE = 'h-5 w-5';

function sourceFiles(directory: URL): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) return sourceFiles(child);
    return entry.name.endsWith('.tsx') ? [child] : [];
  });
}

/** Local names of every lucide icon a file renders, including `as` aliases and the
 *  `Icon` field the notification and menu lists map over. */
function iconNames(source: string): string[] {
  const imports = source.match(/import\s*\{([^}]*)\}\s*from\s*'lucide-react'/g) ?? [];
  const names = imports.flatMap((block) =>
    block
      .replace(/import\s*\{|\}\s*from\s*'lucide-react'/g, '')
      .split(',')
      .map((part) => part.trim().split(/\s+as\s+/).pop() ?? '')
      .filter((name) => /^[A-Z]/.test(name)),
  );
  if (/\bIcon\b\s*[,:}]/.test(source)) names.push('Icon');
  return [...new Set(names)];
}

test('every decorative icon renders at one size', () => {
  const offenders: string[] = [];

  for (const file of sourceFiles(SRC)) {
    const source = readFileSync(file, 'utf8');
    const names = iconNames(source);
    if (names.length === 0) continue;

    for (const name of names) {
      const usages = source.matchAll(
        new RegExp(`<${name}\\s+className="([^"]*)"`, 'g'),
      );
      for (const [, className] of usages) {
        if (!className.includes(ICON_SIZE)) {
          offenders.push(`${file.pathname.split('/src/')[1]} <${name} class="${className}">`);
        }
      }
    }
  }

  assert.deepEqual(offenders, [], `icons must be ${ICON_SIZE}`);
});
