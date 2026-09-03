import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  Ref,
  ReactNode,
} from 'react';
import { iconButtonClasses, type IconButtonSize } from './classes';

type CommonProps = {
  children: ReactNode;
  className?: string;
  size?: IconButtonSize;
};

type IconButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
    ref?: Ref<HTMLButtonElement>;
  };

type IconAnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    ref?: Ref<HTMLAnchorElement>;
  };

export function IconButton({
  className = '',
  size = 'default',
  children,
  ...props
}: IconButtonProps | IconAnchorProps) {
  const classes = `${iconButtonClasses(size)} ${className}`.trim();

  if ('href' in props && props.href !== undefined) {
    return (
      <a {...props} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button {...(props as IconButtonProps)} className={classes}>
      {children}
    </button>
  );
}
