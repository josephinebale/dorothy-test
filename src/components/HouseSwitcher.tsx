import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  House as HouseIcon,
} from 'lucide-react';
import { HOUSES, type House } from '../data/houses';
import {
  ORGANISATION_NAME,
  ROUTES,
} from '../lib/informationArchitecture';
import { href } from '../lib/router';
import { useKeyboardMenu } from '../lib/useKeyboardMenu';
import { HouseMarker } from './HouseMarker';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

type HouseSwitcherProps = {
  house: House;
  onSelect: (houseId: string) => void;
};

/** Every item in the menu shares this row, so items differ only by their leading mark. */
const MENU_ROW =
  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium text-text-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

const MANAGEMENT_ITEMS = [
  { label: 'Manage this house', path: ROUTES.manageHouse, Icon: HouseIcon },
  {
    label: 'Organisation settings',
    path: ROUTES.organisationSettings,
    Icon: Building2,
  },
];

export function HouseSwitcher({ house, onSelect }: HouseSwitcherProps) {
  const menu = useKeyboardMenu();

  return (
    <div className="relative">
      <Button
        ref={menu.triggerRef}
        type="button"
        size="small"
        onClick={menu.toggle}
        onKeyDown={menu.onTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={menu.open}
        aria-label={`Switch house. Current house: ${house.name}`}
        className="max-w-full text-left"
      >
        <HouseMarker house={house} />
        <span className="min-w-0 truncate">{house.name}</span>
        {menu.open ? (
          <ChevronUp className="h-4 w-4 text-text-tertiary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-tertiary" />
        )}
      </Button>

      {menu.open && (
        <Card className="absolute top-full left-0 z-20 mt-1 w-72 shadow-lg">
          <div
            ref={menu.menuRef}
            role="menu"
            aria-label="House and organisation"
            onKeyDown={menu.onMenuKeyDown}
          >
            <div className="py-1">
              <p className="px-3 py-1 text-xs font-medium text-text-secondary">
                {ORGANISATION_NAME}
              </p>

              {HOUSES.map((option) => {
                const selected = option.id === house.id;
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
                    <HouseMarker house={option} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1">
                        <span className="truncate">{option.name}</span>
                        {selected && (
                          <Check className="h-4 w-4 shrink-0 text-brand" />
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
                  {/* Sized to the marker so labels line up across both groups */}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                    <Icon className="h-4 w-4" />
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
