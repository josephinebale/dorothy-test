import { useEffect, useState } from 'react';

function currentPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash === '' ? '/' : hash;
}

/** Old `#/manage-house` bookmarks keep working after the location rename. */
export function canonicalPath(path: string): string {
  let next = path;
  if (next === '/manage-house' || next.startsWith('/manage-house/')) {
    next = `/manage-location${next.slice('/manage-house'.length)}`;
  }
  return next
    .replace(/\/house-name$/, '/location-name')
    .replace(/\/house-picture$/, '/location-picture');
}

export function useHashRoute(): string {
  const [path, setPath] = useState(() => canonicalPath(currentPath()));

  useEffect(() => {
    const onChange = () => {
      const current = currentPath();
      const next = canonicalPath(current);
      if (next !== current) {
        window.location.hash = next;
        return;
      }
      setPath(next);
    };

    window.addEventListener('hashchange', onChange);
    onChange();
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}

export function navigate(path: string): void {
  window.location.hash = path;
  window.scrollTo(0, 0);
}

export function href(path: string): string {
  return `#${path}`;
}
