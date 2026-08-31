import type { BookingStatus } from '../data/houses';

const LABELS: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  requested: 'Requested',
  ended: 'Shift ended',
};

/** Solid rather than tinted, so the pill reads against a Card of the same status tone. */
const STYLES: Record<BookingStatus, string> = {
  confirmed: 'bg-success text-surface',
  requested: 'bg-pending text-surface',
  ended: 'bg-neutral text-surface',
};

export function StatusPill({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`flex w-full items-center justify-center rounded px-1.5 py-1 text-xs font-medium whitespace-nowrap ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
