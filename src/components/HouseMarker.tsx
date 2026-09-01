import type { House } from '../data/houses';
import {
  houseMarkerTone,
  type HouseMarkerTone,
} from '../lib/houseMarker';

const TONE_CLASSES: Record<HouseMarkerTone, string> = {
  green: 'bg-house-green-surface text-house-green-foreground',
  lime: 'bg-house-lime-surface text-house-lime-foreground',
  purple: 'bg-house-purple-surface text-house-purple-foreground',
  orange: 'bg-house-orange-surface text-house-orange-foreground',
  blue: 'bg-house-blue-surface text-house-blue-foreground',
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
