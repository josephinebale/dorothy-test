import { badgeDisplay } from '../header-utils';

export function Badge({
  count,
  tone = 'attention',
}: {
  count: number;
  tone?: 'attention' | 'neutral';
}) {
  const display = badgeDisplay(count);
  if (!display) return null;

  return (
    <span aria-hidden="true" className={`ui-badge ui-badge--${tone}`}>
      {display}
    </span>
  );
}
