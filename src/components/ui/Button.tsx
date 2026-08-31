import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  Ref,
  ReactNode,
} from 'react';
import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from './classes';

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
    ref?: Ref<HTMLButtonElement>;
  };

type AnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    ref?: Ref<HTMLAnchorElement>;
  };

export function Button({
  variant = 'secondary',
  size = 'default',
  className = '',
  children,
  ...props
}: ButtonProps | AnchorProps) {
  const classes = `${buttonClasses(variant, size)} ${className}`.trim();

  if ('href' in props && props.href !== undefined) {
    return (
      <a {...props} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button {...(props as ButtonProps)} className={classes}>
      {children}
    </button>
  );
}
