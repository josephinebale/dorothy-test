import { badgeDisplay } from '../header-utils';

/** An alert count on something interactive. Use `Tag` for a plain label. */
export function Badge({ count }: { count: number }) {
  const display = badgeDisplay(count);
  if (!display) return null;

  return (
    <span aria-hidden="true" className="ui-badge ui-badge--attention inline-flex items-center justify-center leading-none">
      {display}
    </span>
  );
}
