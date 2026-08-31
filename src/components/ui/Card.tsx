import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cardClasses, type CardTone } from './classes';

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
  divided?: boolean;
  tone?: CardTone;
};

export function Card({
  as: Component = 'div',
  children,
  divided = false,
  tone = 'default',
  className = '',
  ...props
}: CardProps) {
  return (
    <Component
      {...props}
      className={`${cardClasses(tone, divided)} ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
