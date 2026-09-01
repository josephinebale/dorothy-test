import type { ReactNode } from 'react';
import { tagClasses, type TagTone } from './classes';

/** A label, not a control. Use `Badge` for alert counts that sit on something clickable. */
export function Tag({
  tone = 'neutral',
  className = '',
  children,
}: {
  tone?: TagTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={`${tagClasses(tone)} ${className}`.trim()}>{children}</span>
  );
}
