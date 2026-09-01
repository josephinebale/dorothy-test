import { useState, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { PageHeading } from '../components/PageHeading';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Button } from '../components/ui/Button';
import { Card as UiCard } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import { IconButton } from '../components/ui/IconButton';
import { LOCATIONS, type LocationData } from '../data/locations';
import {
  ACCOUNT_SECTIONS,
  CAN_EDIT_ORGANISATION_DETAILS,
  LOCATION_SECTIONS,
  MANAGER_NAME,
  ORGANISATION_NAME,
  ORGANISATION_SECTIONS,
  ROUTES,
  sectionFromPath,
  type SettingsSection,
} from '../lib/informationArchitecture';
import { href } from '../lib/router';

function PrivacyNote({ extra }: { extra?: string }) {
  return (
    <p className="mt-1 text-sm text-text-strong">
      {extra}
      More information on how we keep your personal details secure can be found in our{' '}
      <a href={href('/privacy')} className="text-brand underline">
        privacy policy
      </a>
      .
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-text">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={readOnly}
        aria-readonly={readOnly}
        className="mt-1 h-10 w-full rounded border border-border bg-surface px-3 text-sm font-normal text-text"
      />
    </label>
  );
}

function SaveButton({ disabled = false }: { disabled?: boolean }) {
  return (
    <Button type="button" disabled={disabled}>
      Save
    </Button>
  );
}

function SettingsCard({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <UiCard as="section" className="px-6 py-6">
      <h2 className="text-sm font-bold text-text">{title}</h2>
      {intro}
      <div className="mt-3 space-y-4">{children}</div>
    </UiCard>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded border-border"
      />
      {label}
    </label>
  );
}

function OrganisationDetails({ canEdit }: { canEdit: boolean }) {
  const [name, setName] = useState(ORGANISATION_NAME);
  const [address, setAddress] = useState('7 Old South Head Rd, Vaucluse NSW 2030, Australia');
  const [cantFindAddress, setCantFindAddress] = useState(false);
  const [mobile, setMobile] = useState('');
  const [homePhone, setHomePhone] = useState('04657656787');
  const [emergencyName, setEmergencyName] = useState('Dom Green - Manageree');
  const [emergencyMobile, setEmergencyMobile] = useState('');
  const [emergencyHome, setEmergencyHome] = useState('0487676565');

  return (
    <div className="space-y-6">
      <SettingsCard title="Organisation name">
        <Field label="Name" value={name} onChange={setName} readOnly={!canEdit} />
        <SaveButton disabled={!canEdit} />
      </SettingsCard>

      <SettingsCard title="Address" intro={<PrivacyNote />}>
        <Field label="Your address" value={address} onChange={setAddress} readOnly={!canEdit} />
        <CheckRow
          label="Can't find my address"
          checked={cantFindAddress}
          onChange={setCantFindAddress}
          disabled={!canEdit}
        />
        <SaveButton disabled={!canEdit} />
      </SettingsCard>

      <SettingsCard
        title="Contact number"
        intro={<PrivacyNote extra="At least one contact number is required. " />}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Mobile number" value={mobile} onChange={setMobile} readOnly={!canEdit} />
          <Field label="Home phone number" value={homePhone} onChange={setHomePhone} readOnly={!canEdit} />
        </div>
        <SaveButton disabled={!canEdit} />
      </SettingsCard>

      <SettingsCard
        title="Emergency contact"
        intro={
          <p className="mt-1 text-sm text-text-strong">
            Please nominate an adult who may be contacted on their mobile in the event of an
            emergency. This person could be a parent, partner or close friend.
          </p>
        }
      >
        <Field label="Full name" value={emergencyName} onChange={setEmergencyName} readOnly={!canEdit} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Mobile number" value={emergencyMobile} onChange={setEmergencyMobile} readOnly={!canEdit} />
          <Field label="Home phone number" value={emergencyHome} onChange={setEmergencyHome} readOnly={!canEdit} />
        </div>
        <SaveButton disabled={!canEdit} />
      </SettingsCard>
    </div>
  );
}

function PreferenceList({ title, options }: { title: string; options: string[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  return (
    <SettingsCard title={title}>
      <div className="space-y-2">
        {options.map((option) => (
          <CheckRow
            key={option}
            label={option}
            checked={Boolean(selected[option])}
            onChange={(checked) => setSelected((current) => ({ ...current, [option]: checked }))}
          />
        ))}
      </div>
      <SaveButton />
    </SettingsCard>
  );
}

function FinancialDetails({ canEdit }: { canEdit: boolean }) {
  const [abn, setAbn] = useState('12 345 678 901');
  const [accountName, setAccountName] = useState(ORGANISATION_NAME);

  return (
    <SettingsCard title="Financial details" intro={<PrivacyNote />}>
      <Field label="ABN" value={abn} onChange={setAbn} readOnly={!canEdit} />
      <Field label="Account name" value={accountName} onChange={setAccountName} readOnly={!canEdit} />
      <SaveButton disabled={!canEdit} />
    </SettingsCard>
  );
}

function Documents({ canEdit }: { canEdit: boolean }) {
  const items = ['Public liability insurance', 'NDIS registration', 'Police check'];

  return (
    <SettingsCard
      title="Documents"
      intro={
        <p className="mt-1 text-sm text-text-strong">
          Upload documents related to your organisation.
        </p>
      }
    >
      <UiCard as="ul" divided>
        {items.map((item) => (
          <li key={item} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="font-medium text-text">{item}</span>
            <Button type="button" size="small" disabled={!canEdit}>
              Upload
            </Button>
          </li>
        ))}
      </UiCard>
    </SettingsCard>
  );
}

function Account() {
  const [email, setEmail] = useState('helen.dawson@hireupdemo.com');
  const [password, setPassword] = useState('');

  return (
    <SettingsCard title="Account" intro={<PrivacyNote />}>
      <Field label="Email address" value={email} onChange={setEmail} type="email" />
      <div>
        <p className="text-sm font-medium text-text">Profile photo</p>
        <div className="mt-1 flex items-center gap-4">
          <Avatar name={MANAGER_NAME} size="lg" />
          <Button type="button" size="small">
            Choose file
          </Button>
        </div>
      </div>
      <Field label="Password" value={password} onChange={setPassword} type="password" />
      <SaveButton />
    </SettingsCard>
  );
}

function SupportPlan({ locationName }: { locationName: string }) {
  return (
    <SettingsCard title="Support plan">
      <p className="text-sm text-text-strong">
        Manage the support plan shared with workers booked for {locationName}.
      </p>
      <Button type="button">View support plan</Button>
    </SettingsCard>
  );
}

function LocationName({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);

  return (
    <SettingsCard title="Location name">
      <Field label="Name" value={name} onChange={setName} />
      <SaveButton />
    </SettingsCard>
  );
}

const PEOPLE = [
  {
    name: MANAGER_NAME,
    locationAccess: 'Can manage bookings, team and location settings',
    visibleLocations: LOCATIONS.map(({ name }) => name),
  },
  {
    name: 'Dom Green',
    locationAccess: 'Can manage bookings and view the team',
    visibleLocations: LOCATIONS.slice(0, 3).map(({ name }) => name),
  },
  {
    name: 'Priya Shah',
    locationAccess: 'Can view bookings and message the team',
    visibleLocations: LOCATIONS.slice(0, 2).map(({ name }) => name),
  },
];

function PeopleList({
  scope,
  locationName,
  canEdit = true,
}: {
  scope: 'location' | 'organisation';
  locationName: string;
  canEdit?: boolean;
}) {
  return (
    <SettingsCard title="People">
      <UiCard as="ul" divided>
        {PEOPLE.map((person) => (
          <li
            key={person.name}
            className="flex entity-row items-center gap-3 p-3"
          >
            <Avatar name={person.name} size="md" />
            <div className="min-w-0 flex-1">
              <EntityLink as="span">{person.name}</EntityLink>
              <p className="mt-1 text-sm text-text-secondary">
                {scope === 'location'
                  ? `${person.locationAccess} in ${locationName}.`
                  : `Can see ${person.visibleLocations.join(', ')}.`}
              </p>
            </div>
            <IconButton
              type="button"
              disabled={!canEdit}
              aria-label={`More options for ${person.name}`}
              data-tooltip={`More options for ${person.name}`}
              className="ui-tooltip"
            >
              <MoreHorizontal className="h-5 w-5" />
            </IconButton>
          </li>
        ))}
      </UiCard>
    </SettingsCard>
  );
}

function LocationSection({
  section,
  data,
}: {
  section: string;
  data: LocationData;
}) {
  switch (section) {
    case 'preferences':
      return (
        <PreferenceList
          title="Support worker preferences"
          options={[
            'Has a vehicle',
            'Non-smoker',
            'Has a current first aid certificate',
            'Available for sleepovers',
          ]}
        />
      );
    case 'support-plan':
      return <SupportPlan locationName={data.location.name} />;
    case 'location-name':
      return <LocationName initialName={data.location.name} />;
    case 'people':
      return <PeopleList scope="location" locationName={data.location.name} />;
    default:
      return null;
  }
}

function OrganisationSection({
  section,
  data,
  canEdit,
}: {
  section: string;
  data: LocationData;
  canEdit: boolean;
}) {
  switch (section) {
    case 'organisation':
      return <OrganisationDetails canEdit={canEdit} />;
    case 'financial':
      return <FinancialDetails canEdit={canEdit} />;
    case 'documents':
      return <Documents canEdit={canEdit} />;
    case 'people':
      return (
        <PeopleList
          scope="organisation"
          locationName={data.location.name}
          canEdit={canEdit}
        />
      );
    default:
      return null;
  }
}

function AccountSection({ section }: { section: string }) {
  switch (section) {
    case 'account':
      return <Account />;
    default:
      return null;
  }
}

function SettingsPage({
  title,
  path,
  basePath,
  sections,
  renderSection,
}: {
  title: string;
  path: string;
  basePath: string;
  sections: SettingsSection[];
  renderSection: (section: string) => ReactNode;
}) {
  const section = sectionFromPath(path, sections);
  return (
    <div>
      <PageHeading title={title} />
      <div className="grid layout-rail-content items-start gap-6">
      <nav className="relative space-y-1" aria-label={title}>
        <PinnedQuestion
          questionId="settings-sections"
          className="absolute top-1 right-1 z-10"
        />
        {sections.map((item) => {
          const active = section === item.id;
          return (
            <a
              key={item.id}
              href={href(`${basePath}/${item.id}`)}
              aria-current={active ? 'page' : undefined}
              className={`flex w-full items-center border-l-2 px-3 py-2 text-left text-sm ${
                active
                  ? 'border-brand bg-info-surface font-medium text-text'
                  : 'border-transparent text-text-strong hover:bg-surface-subtle'
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="w-full max-w-content">
        {renderSection(section)}
      </div>
      </div>
    </div>
  );
}

export function ManageLocationSettings({
  data,
  path,
}: {
  data: LocationData;
  path: string;
}) {
  return (
    <SettingsPage
      title="Location settings"
      path={path}
      basePath={ROUTES.manageLocation}
      sections={LOCATION_SECTIONS}
      renderSection={(section) => <LocationSection section={section} data={data} />}
    />
  );
}

export function OrganisationSettings({
  data,
  path,
  canEdit = CAN_EDIT_ORGANISATION_DETAILS,
}: {
  data: LocationData;
  path: string;
  canEdit?: boolean;
}) {
  return (
    <SettingsPage
      title="Organisation settings"
      path={path}
      basePath={ROUTES.organisationSettings}
      sections={ORGANISATION_SECTIONS}
      renderSection={(section) => (
        <OrganisationSection
          section={section}
          data={data}
          canEdit={canEdit}
        />
      )}
    />
  );
}

export function YourAccountSettings({ path }: { path: string }) {
  return (
    <SettingsPage
      title="Your account"
      path={path}
      basePath={ROUTES.yourAccount}
      sections={ACCOUNT_SECTIONS}
      renderSection={(section) => <AccountSection section={section} />}
    />
  );
}
