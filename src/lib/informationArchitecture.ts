export const ORGANISATION_NAME = 'Cerebral Palsy Alliance';
export const MANAGER_NAME = 'Helen Dawson';
export const CAN_EDIT_ORGANISATION_DETAILS = false;

export const ROUTES = {
  manageLocation: '/manage-location',
  organisationSettings: '/organisation-settings',
  yourAccount: '/your-account',
} as const;

export type SettingsSection = {
  id: string;
  label: string;
};

export const LOCATION_SECTIONS: SettingsSection[] = [
  { id: 'preferences', label: 'Support worker preferences' },
  { id: 'support-plan', label: 'Support plan' },
  { id: 'location-name', label: 'Location name' },
  { id: 'people', label: 'People' },
];

export const ORGANISATION_SECTIONS: SettingsSection[] = [
  { id: 'organisation', label: 'Organisation details' },
  { id: 'financial', label: 'Financial details' },
  { id: 'documents', label: 'Documents' },
  { id: 'people', label: 'People' },
];

export const ACCOUNT_SECTIONS: SettingsSection[] = [
  { id: 'account', label: 'Account' },
];

export const PERSONAL_MENU_ITEMS = [
  { label: 'Your account', path: '/your-account' },
] as const;

const LEGACY_SECTION_IDS: Record<string, string> = {
  'house-name': 'location-name',
  'house-picture': 'location-picture',
};

export function sectionFromPath(
  path: string,
  sections: SettingsSection[],
): string {
  const requested = path.split('/').filter(Boolean).at(-1);
  const id = requested ? (LEGACY_SECTION_IDS[requested] ?? requested) : undefined;
  return sections.find((section) => section.id === id)?.id ?? sections[0].id;
}

export function menuIndexAfterKey(
  currentIndex: number,
  key: string,
  itemCount: number,
): number | null {
  if (key === 'Escape') return null;
  if (key === 'Home') return 0;
  if (key === 'End') return itemCount - 1;
  if (key === 'ArrowDown') return (currentIndex + 1) % itemCount;
  if (key === 'ArrowUp') return (currentIndex - 1 + itemCount) % itemCount;
  return currentIndex;
}
