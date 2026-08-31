import { useEffect, useRef } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronUp,
  CircleUser,
  LogOut,
  LockKeyhole,
  Shield,
  Settings,
} from 'lucide-react';
import type { House } from '../data/houses';
import {
  MANAGER_NAME,
  PERSONAL_MENU_ITEMS,
} from '../lib/informationArchitecture';
import { TEAM_ROUTE } from '../lib/pageContent';
import { href } from '../lib/router';
import { useKeyboardMenu } from '../lib/useKeyboardMenu';
import { Avatar } from './Avatar';
import {
  accountAccessibleName,
  bookingsAccessibleName,
  messagesAccessibleName,
  notificationsAccessibleName,
} from './header-utils';
import { HouseSwitcher } from './HouseSwitcher';
import { Logo } from './Logo';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Bookings', path: '/bookings' },
  { label: 'Messages', path: '/messages' },
  { label: 'Team', path: TEAM_ROUTE },
];

const ACCOUNT_ICONS = {
  Profile: CircleUser,
  Account: Settings,
  Privacy: Shield,
  Password: LockKeyhole,
};

type AppHeaderProps = {
  house: House;
  path: string;
  unreadMessages: number;
  bookingsBadge: number;
  unreadNotifications: number;
  onSelectHouse: (houseId: string) => void;
  onSignOut: () => void;
};

export function AppHeader({
  house,
  path,
  unreadMessages,
  bookingsBadge,
  unreadNotifications,
  onSelectHouse,
  onSignOut,
}: AppHeaderProps) {
  const accountMenu = useKeyboardMenu();
  const activeNavRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeNavRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [path]);

  return (
    <header className="sticky top-0 z-20 bg-surface">
      <div className="border-b border-border-subtle">
        <div className="header-identity mx-auto flex max-w-page items-center justify-between gap-8 px-8">
          <a
            href={href('/')}
            aria-label="Hireup for Providers dashboard"
            className="shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Logo />
          </a>

          <div className="flex shrink-0 items-center gap-4">
            <Button
              href={href('/notifications')}
              variant="ghost"
              aria-label={notificationsAccessibleName(unreadNotifications)}
              className={`header-identity-control ${
                path === '/notifications' ? 'bg-surface-selected' : ''
              }`}
            >
              <Bell className="h-5 w-5 shrink-0" />
              Notifications
              <Badge count={unreadNotifications} />
            </Button>

            <span
              aria-hidden="true"
              className="h-6 w-px shrink-0 bg-border-subtle"
            />

            <div className="relative">
            <Button
              ref={accountMenu.triggerRef}
              type="button"
              variant="ghost"
              onClick={accountMenu.toggle}
              onKeyDown={accountMenu.onTriggerKeyDown}
              aria-haspopup="menu"
              aria-expanded={accountMenu.open}
              aria-label={accountAccessibleName(MANAGER_NAME)}
              className="header-identity-control"
            >
              <Avatar name={MANAGER_NAME} size="sm" />
              <span className="max-w-40 truncate">{MANAGER_NAME}</span>
              {accountMenu.open ? (
                <ChevronUp className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
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
                {PERSONAL_MENU_ITEMS.map(({ label, path: itemPath }) => {
                  const Icon = ACCOUNT_ICONS[label];
                  return (
                  <a
                    key={itemPath}
                    role="menuitem"
                    tabIndex={-1}
                    href={href(itemPath)}
                    onClick={() => accountMenu.close()}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-text-strong hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-text-strong" />
                    {label}
                  </a>
                  );
                })}
                <button
                  role="menuitem"
                  tabIndex={-1}
                  type="button"
                  onClick={() => {
                    accountMenu.close();
                    onSignOut();
                  }}
                  className="flex w-full items-center gap-3 border-t border-border-subtle px-3 py-2 text-left text-sm text-text-strong hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <LogOut className="h-4 w-4 shrink-0 text-text-strong" />
                  Log out
                </button>
                </div>
              </Card>
            )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-border-subtle">
        <div className="header-navigation mx-auto flex max-w-page items-stretch px-8">
          <div className="flex shrink-0 items-center">
            <HouseSwitcher house={house} onSelect={onSelectHouse} />
          </div>

          <span
            aria-hidden="true"
            className="mx-6 h-6 w-px shrink-0 self-center bg-border-subtle"
          />

          <div className="min-w-0 flex-1 overflow-x-auto">
          <nav className="flex h-full w-max items-stretch gap-8" aria-label="Main">
            {NAV_ITEMS.map((item) => {
              const active = item.path === '/' ? path === '/' : path.startsWith(item.path);
              const count =
                item.label === 'Bookings'
                  ? bookingsBadge
                  : item.label === 'Messages'
                    ? unreadMessages
                    : 0;

              return (
                <a
                  key={item.path}
                  ref={active ? activeNavRef : undefined}
                  href={href(item.path)}
                  aria-current={active ? 'page' : undefined}
                  aria-label={
                    item.label === 'Bookings'
                      ? bookingsAccessibleName(bookingsBadge)
                      : item.label === 'Messages'
                        ? messagesAccessibleName(unreadMessages)
                        : item.label
                  }
                  className={`flex h-full shrink-0 items-center gap-2 border-b-2 pt-1 text-sm main-nav-link ${
                    active
                      ? 'border-brand font-medium text-text'
                      : 'border-transparent text-text-strong hover:bg-surface-subtle hover:text-text'
                  }`}
                >
                  <span>{item.label}</span>
                  <Badge count={count} />
                </a>
              );
            })}
          </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
