import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export function EntityLink({
  as: Component = 'a',
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
  href?: string;
}) {
  return (
    <Component {...props} className={`ui-entity-link ${className}`.trim()}>
      {children}
    </Component>
  );
}
