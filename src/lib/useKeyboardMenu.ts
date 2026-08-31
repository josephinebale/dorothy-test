import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { menuIndexAfterKey } from './informationArchitecture';

export function useKeyboardMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const items = useCallback(
    () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
      ),
    [],
  );

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const openAt = useCallback(
    (index = 0) => {
      setOpen(true);
      requestAnimationFrame(() => {
        const menuItems = items();
        menuItems[index < 0 ? menuItems.length - 1 : index]?.focus();
      });
    },
    [items],
  );

  const toggle = useCallback(() => {
    if (open) close();
    else openAt();
  }, [close, open, openAt]);

  const onTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      openAt(event.key === 'ArrowUp' ? -1 : 0);
    },
    [openAt],
  );

  const onMenuKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const menuItems = items();
      const currentIndex = Math.max(
        0,
        menuItems.indexOf(document.activeElement as HTMLElement),
      );
      const nextIndex = menuIndexAfterKey(
        currentIndex,
        event.key,
        menuItems.length,
      );

      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Home' ||
        event.key === 'End'
      ) {
        event.preventDefault();
        if (nextIndex !== null) menuItems[nextIndex]?.focus();
      }
      if (event.key === 'Tab') setOpen(false);
    },
    [close, items],
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        close(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [close, open]);

  return {
    open,
    triggerRef,
    menuRef,
    toggle,
    close,
    onTriggerKeyDown,
    onMenuKeyDown,
  };
}
