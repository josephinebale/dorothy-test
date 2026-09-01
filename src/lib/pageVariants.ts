/**
 * Pages that have a second version the moderator can reveal mid-session. The
 * label doubles as the control's accessible name, so it says what appears.
 */
const VARIANT_LABELS: Record<string, string> = {
  '/request-booking': 'Show more worker detail',
};

export function variantLabel(path: string): string | null {
  return VARIANT_LABELS[path] ?? null;
}
