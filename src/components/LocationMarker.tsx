import type { Location } from '../data/locations';

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

// 36px alongside a 36px avatar in list rows; 28px inside the bordered header
// trigger, which only has 34px of content box to give.
const MARKER_SIZE = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
} as const;

export function LocationMarker({
  location,
  size = 'md',
}: {
  location: Pick<Location, 'id' | 'name'>;
  size?: keyof typeof MARKER_SIZE;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex ${MARKER_SIZE[size]} shrink-0 items-center justify-center rounded-lg bg-location-surface text-xs font-bold text-location-foreground`}
    >
      {initials(location.name)}
    </span>
  );
}
