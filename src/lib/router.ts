import { useEffect, useState } from 'react';

function currentPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash === '' ? '/' : hash;
}

export function useHashRoute(): string {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onChange);
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
