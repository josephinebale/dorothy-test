import { avatarFor } from '../data/avatars';
import { avatarToken, type AvatarSize } from './ui/classes';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

type AvatarProps = {
  name: string;
  size?: AvatarSize;
};

const INTRINSIC_SIZE: Record<AvatarSize, number> = {
  sm: 28,
  md: 36,
  lg: 44,
};

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const photo = avatarFor(name);
  const pixels = INTRINSIC_SIZE[size];
  const dimension = avatarToken(size);

  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        width={pixels}
        height={pixels}
        style={{ width: dimension, height: dimension }}
        className={`avatar avatar--${size} object-cover ring-1 ring-text-strong`}
      />
    );
  }

  return (
    <span
      className={`avatar avatar--${size} inline-flex items-center justify-center bg-text-strong font-medium text-surface`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
