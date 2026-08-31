import type { House } from '../data/houses';
import {
  houseMarkerTone,
  type HouseMarkerTone,
} from '../lib/houseMarker';

const TONE_CLASSES: Record<HouseMarkerTone, string> = {
  indigo: 'bg-house-indigo-surface text-house-indigo-foreground',
  teal: 'bg-house-teal-surface text-house-teal-foreground',
  amber: 'bg-house-amber-surface text-house-amber-foreground',
  rose: 'bg-house-rose-surface text-house-rose-foreground',
  violet: 'bg-house-violet-surface text-house-violet-foreground',
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

export function HouseMarker({
  house,
}: {
  house: Pick<House, 'id' | 'name'>;
}) {
  const tone = houseMarkerTone(house.id);

  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold ${TONE_CLASSES[tone]}`}
    >
      {initials(house.name)}
    </span>
  );
}
