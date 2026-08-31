export const HOUSE_MARKER_TONES = [
  'indigo',
  'teal',
  'amber',
  'rose',
  'violet',
] as const;

export type HouseMarkerTone = (typeof HOUSE_MARKER_TONES)[number];

const KNOWN_HOUSE_TONES: Record<string, HouseMarkerTone> = {
  'bellbird-court': 'indigo',
  'kingfisher-place': 'teal',
  'wattle-grove': 'amber',
  'rosella-rise': 'rose',
  'banksia-street': 'violet',
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
