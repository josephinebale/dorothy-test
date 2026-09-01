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
  { id: 'support-areas', label: 'Support areas' },
  { id: 'specialised', label: 'Specialised support' },
  { id: 'covid', label: 'COVID-19 requirements' },
  { id: 'support-plan', label: 'Support plan' },
  { id: 'location-name', label: 'Location name' },
  { id: 'location-picture', label: 'Location picture' },
  { id: 'people', label: 'People' },
];

export const ORGANISATION_SECTIONS: SettingsSection[] = [
  { id: 'organisation', label: 'Organisation details' },
  { id: 'financial', label: 'Financial details' },
  { id: 'documents', label: 'Documents' },
  { id: 'people', label: 'People' },
];

export const ACCOUNT_SECTIONS: SettingsSection[] = [
  { id: 'about-you', label: 'About you' },
  { id: 'profile-picture', label: 'Profile picture' },
  { id: 'account', label: 'Account' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'password', label: 'Password' },
];

export const PERSONAL_MENU_ITEMS = [
  { label: 'Profile', path: '/your-account/about-you' },
  { label: 'Account', path: '/your-account/account' },
  { label: 'Privacy', path: '/your-account/privacy' },
  { label: 'Password', path: '/your-account/password' },
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
