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

export function LocationMarker({
  location,
}: {
  location: Pick<Location, 'id' | 'name'>;
}) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-location-surface text-xs font-bold text-location-foreground"
    >
      {initials(location.name)}
    </span>
  );
}
