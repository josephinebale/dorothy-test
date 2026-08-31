export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'default' | 'small';
export type IconButtonSize = 'default' | 'small';
export type AvatarSize = 'sm' | 'md' | 'lg';
export type CardTone = 'default' | 'success' | 'pending' | 'neutral' | 'subtle';

export function buttonClasses(variant: ButtonVariant, size: ButtonSize): string {
  return `ui-button ui-button--${variant} ui-button--${size}`;
}

export function iconButtonClasses(size: IconButtonSize): string {
  return `ui-icon-button ui-icon-button--${size}`;
}

export function cardClasses(tone: CardTone, divided: boolean): string {
  return `ui-card ui-card--${tone}${divided ? ' ui-card--divided' : ''}`;
}

export function avatarToken(size: AvatarSize): string {
  return `var(--avatar-${size})`;
}
