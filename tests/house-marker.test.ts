import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  HOUSE_MARKER_TONES,
  houseMarkerTone,
} from '../src/lib/houseMarker.ts';

const HOUSE_IDS = [
  'bellbird-court',
  'kingfisher-place',
  'wattle-grove',
  'rosella-rise',
  'banksia-street',
];

function luminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground: string, surface: string): number {
  const a = luminance(foreground);
  const b = luminance(surface);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test('each prototype house has a stable, distinct marker tone', () => {
  const tones = HOUSE_IDS.map(houseMarkerTone);
  assert.equal(new Set(tones).size, HOUSE_IDS.length);
  assert.equal(houseMarkerTone('bellbird-court'), houseMarkerTone('bellbird-court'));
});

test('every house marker token pair passes AA contrast', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');

  for (const tone of HOUSE_MARKER_TONES) {
    const surface = css.match(
      new RegExp(`--color-house-${tone}-surface:\\s*(#[0-9A-Fa-f]{6})`),
    )?.[1];
    const foreground = css.match(
      new RegExp(`--color-house-${tone}-foreground:\\s*(#[0-9A-Fa-f]{6})`),
    )?.[1];

    assert.ok(surface, `missing ${tone} surface token`);
    assert.ok(foreground, `missing ${tone} foreground token`);
    assert.ok(
      contrast(foreground, surface) >= 4.5,
      `${tone} marker contrast must pass 4.5:1`,
    );
  }
});
