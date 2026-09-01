import type { House } from '../data/houses';

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

export function HouseMarker({ house }: { house: Pick<House, 'id' | 'name'> }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-house-surface text-xs font-bold text-house-foreground"
    >
      {initials(house.name)}
    </span>
  );
}
