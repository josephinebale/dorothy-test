import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/** The only colour in the Cerebral Palsy Alliance logo (CP-Brandmark-1-1.svg). */
const LOGO_GREEN = '#2E953E';

function channels(hex: string): number[] {
  return hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16));
}

function luminance(hex: string): number {
  const linear = channels(hex)
    .map((channel) => channel / 255)
    .map((channel) =>
      channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground: string, surface: string): number {
  const a = luminance(foreground);
  const b = luminance(surface);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Whether a colour sits on the same hue ramp as the logo: green dominant, red
 *  and blue below it, and red and blue close to each other. */
function isLogoGreenFamily(hex: string): boolean {
  const [red, green, blue] = channels(hex);
  const [logoRed, logoGreen, logoBlue] = channels(LOGO_GREEN);
  return (
    green > red &&
    green > blue &&
    logoGreen > logoRed &&
    logoGreen > logoBlue &&
    Math.abs(red - blue) <= 24
  );
}

function token(name: string): string {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  const value = css.match(new RegExp(`--color-${name}:\\s*(#[0-9A-Fa-f]{6})`))?.[1];
  assert.ok(value, `missing --color-${name}`);
  return value;
}

test('every location shares one marker colour taken from the logo', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');

  assert.doesNotMatch(
    css,
    /--color-house-(green|lime|purple|orange|blue)-/,
    'per-location marker tones should be replaced by one shared pair',
  );
  assert.ok(isLogoGreenFamily(token('house-surface')));
  assert.ok(isLogoGreenFamily(token('house-foreground')));
});

test('marker initials pass AA against the marker surface', () => {
  assert.ok(
    contrast(token('house-foreground'), token('house-surface')) >= 4.5,
    'marker initials must pass 4.5:1',
  );
});

test('the marker renders one colour rather than a per-location tone', () => {
  const marker = readFileSync(
    new URL('../src/components/HouseMarker.tsx', import.meta.url),
    'utf8',
  );
  assert.match(marker, /bg-house-surface/);
  assert.match(marker, /text-house-foreground/);
  assert.doesNotMatch(marker, /houseMarkerTone/);
});
