import { useEffect, useRef } from 'react';
import {
  Bell,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import type { Location } from '../data/locations';
import {
  MANAGER_NAME,
  PERSONAL_MENU_ITEMS,
} from '../lib/informationArchitecture';
import { BOOKING_DETAIL_ROUTE, TEAM_ROUTE } from '../lib/pageContent';
import { href } from '../lib/router';
import { useKeyboardMenu } from '../lib/useKeyboardMenu';
import { Avatar } from './Avatar';
import {
  accountAccessibleName,
  bookingsAccessibleName,
  messagesAccessibleName,
  notificationsAccessibleName,
} from './header-utils';
import { LocationSwitcher } from './LocationSwitcher';
import { Logo } from './Logo';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { IconButton } from './ui/IconButton';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Bookings', path: '/bookings' },
  { label: 'Team', path: TEAM_ROUTE },
];

type AppHeaderProps = {
  location: Location;
  path: string;
  unreadMessages: number;
  bookingsBadge: number;
  unreadNotifications: number;
  onSelectLocation: (locationId: string) => void;
  onSignOut: () => void;
};

export function AppHeader({
  location,
  path,
  unreadMessages,
  bookingsBadge,
  unreadNotifications,
  onSelectLocation,
  onSignOut,
}: AppHeaderProps) {
  const accountMenu = useKeyboardMenu();
  const activeNavRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeNavRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [path]);

  const messagesName = messagesAccessibleName(unreadMessages);
  const notificationsName = notificationsAccessibleName(unreadNotifications);
  const accountName = accountAccessibleName(MANAGER_NAME);

  return (
    <header className="app-header z-20">
      <div className="app-header-identity">
        <div
          className="app-header-row mx-auto flex max-w-page items-center justify-between gap-4 px-8"
          style={{ height: 'var(--header-identity-height)' }}
        >
          <div className="flex min-w-0 items-center gap-6">
            <a
              href={href('/')}
              aria-label="Hireup for Providers dashboard"
              className="shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Logo />
            </a>
          <LocationSwitcher location={location} onSelect={onSelectLocation} />
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <IconButton
              href={href('/messages')}
              aria-label={messagesName}
              data-tooltip={messagesName}
              className={`header-utility relative ui-tooltip ${
                path === '/messages' ? 'header-utility--active' : ''
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <Badge count={unreadMessages} />
            </IconButton>

            <IconButton
              href={href('/notifications')}
              aria-label={notificationsName}
              data-tooltip={notificationsName}
              className={`header-utility relative ui-tooltip ${
                path === '/notifications' ? 'header-utility--active' : ''
              }`}
            >
              <Bell className="h-5 w-5" />
              <Badge count={unreadNotifications} />
            </IconButton>

            <div className="relative flex items-center">
              <Button
                ref={accountMenu.triggerRef}
                type="button"
                variant="ghost"
                size="default"
                onClick={accountMenu.toggle}
                onKeyDown={accountMenu.onTriggerKeyDown}
                aria-haspopup="menu"
                aria-expanded={accountMenu.open}
                aria-label={accountName}
                className="header-menu-trigger"
              >
                <Avatar name={MANAGER_NAME} size="sm" />
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-text-tertiary transition-transform ${
                    accountMenu.open ? 'rotate-180' : ''
                  }`}
                />
              </Button>

              {accountMenu.open && (
                <Card className="absolute top-full right-0 z-20 mt-1 w-72 shadow-lg">
                  <div
                    ref={accountMenu.menuRef}
                    role="menu"
                    aria-label="Your account"
                    onKeyDown={accountMenu.onMenuKeyDown}
                    className="py-1"
                  >
                    <p className="px-3 py-2 text-sm font-bold text-text">
                      {MANAGER_NAME}
                    </p>
                    {PERSONAL_MENU_ITEMS.map(({ label, path: itemPath }) => (
                      <a
                        key={itemPath}
                        role="menuitem"
                        tabIndex={-1}
                        href={href(itemPath)}
                        onClick={() => accountMenu.close()}
                        className="block px-3 py-2 text-sm text-text-strong hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        {label}
                      </a>
                    ))}
                    <div
                      role="separator"
                      className="border-t border-border-subtle"
                    />
                    <button
                      role="menuitem"
                      tabIndex={-1}
                      type="button"
                      onClick={() => {
                        accountMenu.close();
                        onSignOut();
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-text-strong hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Log out
                    </button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="app-header-nav-row mx-auto flex max-w-page items-stretch overflow-x-auto px-8">
          <nav className="flex h-full w-max items-stretch" aria-label="Main">
            {NAV_ITEMS.map((item) => {
              const bookingRequestRoute =
                item.path === '/bookings' &&
                (path === '/request-booking' ||
                  path.startsWith('/bookings/request/') ||
                  path.startsWith(BOOKING_DETAIL_ROUTE));
              const active =
                bookingRequestRoute ||
                (item.path === '/' ? path === '/' : path.startsWith(item.path));
              const count = item.label === 'Bookings' ? bookingsBadge : 0;

              return (
                <a
                  key={item.path}
                  ref={active ? activeNavRef : undefined}
                  href={href(item.path)}
                  aria-current={active ? 'page' : undefined}
                  aria-label={
                    item.label === 'Bookings'
                      ? bookingsAccessibleName(bookingsBadge)
                      : item.label
                  }
                  className={`main-nav-link h-full shrink-0 text-sm ${
                    active
                      ? 'main-nav-link--active font-bold text-text'
                      : 'font-medium text-text-strong'
                  }`}
                >
                  <span>{item.label}</span>
                  <Badge count={count} />
                </a>
              );
            })}
          </nav>
      </div>
    </header>
  );
}
