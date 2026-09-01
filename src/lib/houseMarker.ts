export const HOUSE_MARKER_TONES = [
  'green',
  'lime',
  'purple',
  'orange',
  'blue',
] as const;

export type HouseMarkerTone = (typeof HOUSE_MARKER_TONES)[number];

const KNOWN_HOUSE_TONES: Record<string, HouseMarkerTone> = {
  'dee-why-1': 'green',
  'galston-1': 'lime',
  hornsby: 'purple',
  'north-ryde-1': 'orange',
  wahroonga: 'blue',
};

export function houseMarkerTone(id: string): HouseMarkerTone {
  const known = KNOWN_HOUSE_TONES[id];
  if (known) return known;

  const hash = [...id].reduce(
    (total, character) => (total * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
  return HOUSE_MARKER_TONES[hash % HOUSE_MARKER_TONES.length];
}
