import {
  Building2,
  Check,
  ChevronDown,
  House,
} from 'lucide-react';
import { LOCATIONS, type Location } from '../data/locations';
import {
  ORGANISATION_NAME,
  ROUTES,
} from '../lib/informationArchitecture';
import { href } from '../lib/router';
import { useKeyboardMenu } from '../lib/useKeyboardMenu';
import { LocationMarker } from './LocationMarker';
import { PinnedQuestion } from './PinnedQuestion';
import { Card } from './ui/Card';

type LocationSwitcherProps = {
  location: Location;
  onSelect: (locationId: string) => void;
};

/** Every item in the menu shares this row, so items differ only by their leading mark. */
const MENU_ROW =
  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium text-text-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

const MANAGEMENT_ITEMS = [
  { label: 'Location settings', path: ROUTES.manageLocation, Icon: House },
  {
    label: 'Organisation settings',
    path: ROUTES.organisationSettings,
    Icon: Building2,
  },
];

export function LocationSwitcher({ location, onSelect }: LocationSwitcherProps) {
  const menu = useKeyboardMenu();

  return (
    <div className="relative flex shrink-0 items-center gap-1">
      <button
        ref={menu.triggerRef}
        type="button"
        onClick={menu.toggle}
        onKeyDown={menu.onTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={menu.open}
        aria-label={`Switch location. Current location: ${location.name}`}
        className="header-menu-trigger location-switcher-trigger"
      >
        <LocationMarker location={location} size="sm" />
        <span className="min-w-0 truncate text-sm font-medium text-text">
          {location.name}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-text-tertiary transition-transform ${
            menu.open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <PinnedQuestion questionId="access-context" />

      {menu.open && (
        <Card className="absolute top-full left-0 z-20 mt-1 w-72 shadow-lg">
          <div
            ref={menu.menuRef}
            role="menu"
            aria-label="Location and organisation"
            onKeyDown={menu.onMenuKeyDown}
          >
            <div className="py-1">
              <p className="px-3 py-1 text-xs font-medium text-text-secondary">
                {ORGANISATION_NAME}
              </p>

              {LOCATIONS.map((option) => {
                const selected = option.id === location.id;
                return (
                  <button
                    key={option.id}
                    role="menuitem"
                    tabIndex={-1}
                    type="button"
                    onClick={() => {
                      onSelect(option.id);
                      menu.close();
                    }}
                    className={`${MENU_ROW} ${
                      selected ? 'bg-surface-selected' : 'hover:bg-surface-subtle'
                    }`}
                  >
                    <LocationMarker location={option} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1">
                        <span className="truncate">{option.name}</span>
                        {selected && (
                          <Check className="h-5 w-5 shrink-0 text-brand" />
                        )}
                      </span>
                      <span className="mt-1 block truncate text-xs font-normal text-text-secondary">
                        {option.suburb}, {option.state}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-border-subtle py-1">
              {MANAGEMENT_ITEMS.map(({ label, path, Icon }) => (
                <a
                  key={path}
                  role="menuitem"
                  tabIndex={-1}
                  href={href(path)}
                  onClick={() => menu.close()}
                  className={`${MENU_ROW} hover:bg-surface-subtle`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </span>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
