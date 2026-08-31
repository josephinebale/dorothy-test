import { useState, type ReactNode } from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { PageHeading } from '../components/PageHeading';
import { Button } from '../components/ui/Button';
import { Card as UiCard } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import { IconButton } from '../components/ui/IconButton';
import { HOUSES, type HouseData } from '../data/houses';
import {
  ACCOUNT_SECTIONS,
  CAN_EDIT_ORGANISATION_DETAILS,
  HOUSE_SECTIONS,
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

function AboutYou() {
  const [firstName, setFirstName] = useState('Helen');
  const [lastName, setLastName] = useState('Dawson');
  const [preferred, setPreferred] = useState('Helen');

  return (
    <SettingsCard title="About you" intro={<PrivacyNote />}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="First name" value={firstName} onChange={setFirstName} />
        <Field label="Last name" value={lastName} onChange={setLastName} />
      </div>
      <Field label="Preferred name" value={preferred} onChange={setPreferred} />
      <SaveButton />
    </SettingsCard>
  );
}

function ProfilePicture() {
  return (
    <SettingsCard
      title="Profile picture"
      intro={
        <p className="mt-1 text-sm text-text-strong">
          This photo is shown on your organisation profile.
        </p>
      }
    >
      <div className="flex items-center gap-4">
        <Avatar name="Helen Dawson" size="lg" />
        <Button type="button" size="small">
          Choose file
        </Button>
      </div>
      <SaveButton />
    </SettingsCard>
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
  const [accountName, setAccountName] = useState('Hireup Demonstration Co');

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

function CovidRequirements() {
  const [status, setStatus] = useState('up-to-date');

  return (
    <SettingsCard title="COVID-19 requirements">
      <label className="block text-sm font-medium text-text">
        Vaccination status
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="mt-1 h-10 w-full rounded border border-border bg-surface px-3 text-sm font-normal text-text"
        >
          <option value="up-to-date">Up to date</option>
          <option value="not-required">Not required</option>
          <option value="prefer-not">Prefer not to say</option>
        </select>
      </label>
      <SaveButton />
    </SettingsCard>
  );
}

function Account() {
  const [email, setEmail] = useState('helen.dawson@hireupdemo.com');

  return (
    <SettingsCard title="Account" intro={<PrivacyNote />}>
      <Field label="Email address" value={email} onChange={setEmail} type="email" />
      <SaveButton />
    </SettingsCard>
  );
}

function PrivacySettings() {
  const [sharePlan, setSharePlan] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <SettingsCard title="Privacy">
      <CheckRow
        label="Share the latest support plan with booked workers"
        checked={sharePlan}
        onChange={setSharePlan}
      />
      <CheckRow
        label="Receive product updates by email"
        checked={marketing}
        onChange={setMarketing}
      />
      <SaveButton />
    </SettingsCard>
  );
}

function Password() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <SettingsCard title="Password">
      <Field label="Current password" value={current} onChange={setCurrent} type="password" />
      <Field label="New password" value={next} onChange={setNext} type="password" />
      <Field label="Confirm new password" value={confirm} onChange={setConfirm} type="password" />
      <SaveButton />
    </SettingsCard>
  );
}

function SupportPlan({ houseName }: { houseName: string }) {
  return (
    <SettingsCard title="Support plan">
      <p className="text-sm text-text-strong">
        Manage the support plan shared with workers booked for {houseName}.
      </p>
      <Button type="button">View support plan</Button>
    </SettingsCard>
  );
}

function HouseName({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);

  return (
    <SettingsCard title="House name">
      <Field label="Name" value={name} onChange={setName} />
      <SaveButton />
    </SettingsCard>
  );
}

function HousePicture({ houseName }: { houseName: string }) {
  return (
    <SettingsCard title="House picture">
      <div className="flex items-center gap-4">
        <Avatar name={houseName} size="lg" />
        <Button type="button" size="small">
          Choose file
        </Button>
      </div>
      <SaveButton />
    </SettingsCard>
  );
}

const PEOPLE = [
  {
    name: MANAGER_NAME,
    houseAccess: 'Can manage bookings, team and house settings',
    visibleHouses: HOUSES.map(({ name }) => name),
  },
  {
    name: 'Dom Green',
    houseAccess: 'Can manage bookings and view the team',
    visibleHouses: HOUSES.slice(0, 3).map(({ name }) => name),
  },
  {
    name: 'Priya Shah',
    houseAccess: 'Can view bookings and message the team',
    visibleHouses: HOUSES.slice(0, 2).map(({ name }) => name),
  },
];

function PeopleList({
  scope,
  houseName,
  canEdit = true,
}: {
  scope: 'house' | 'organisation';
  houseName: string;
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
                {scope === 'house'
                  ? `${person.houseAccess} in ${houseName}.`
                  : `Can see ${person.visibleHouses.join(', ')}.`}
              </p>
            </div>
            <IconButton
              type="button"
              disabled={!canEdit}
              aria-label={`More options for ${person.name}`}
            >
              <MoreHorizontal className="h-5 w-5" />
            </IconButton>
          </li>
        ))}
      </UiCard>
    </SettingsCard>
  );
}

function HouseSection({
  section,
  data,
}: {
  section: string;
  data: HouseData;
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
    case 'support-areas':
      return (
        <PreferenceList
          title="Support areas"
          options={[
            'Personal care',
            'Community access',
            'Domestic assistance',
            'Transport',
            'Social and recreational',
          ]}
        />
      );
    case 'specialised':
      return (
        <PreferenceList
          title="Specialised support"
          options={[
            'Complex bowel care',
            'Enteral feeding',
            'Catheter care',
            'Ventilator management',
          ]}
        />
      );
    case 'covid':
      return <CovidRequirements />;
    case 'support-plan':
      return <SupportPlan houseName={data.house.name} />;
    case 'house-name':
      return <HouseName initialName={data.house.name} />;
    case 'house-picture':
      return <HousePicture houseName={data.house.name} />;
    case 'people':
      return <PeopleList scope="house" houseName={data.house.name} />;
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
  data: HouseData;
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
          houseName={data.house.name}
          canEdit={canEdit}
        />
      );
    default:
      return null;
  }
}

function AccountSection({ section }: { section: string }) {
  switch (section) {
    case 'about-you':
      return <AboutYou />;
    case 'profile-picture':
      return <ProfilePicture />;
    case 'account':
      return <Account />;
    case 'privacy':
      return <PrivacySettings />;
    case 'password':
      return <Password />;
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
      <nav className="space-y-1" aria-label={title}>
        {sections.map((item) => {
          const active = section === item.id;
          return (
            <a
              key={item.id}
              href={href(`${basePath}/${item.id}`)}
              aria-current={active ? 'page' : undefined}
              className={`flex w-full items-center justify-between border-l-4 px-3 py-3 text-left text-sm ${
                active
                  ? 'border-brand font-medium text-text'
                  : 'border-transparent text-text-strong hover:bg-surface-subtle'
              }`}
            >
              {item.label}
              <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary" />
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

export function ManageHouseSettings({
  data,
  path,
}: {
  data: HouseData;
  path: string;
}) {
  return (
    <SettingsPage
      title="Manage this house"
      path={path}
      basePath={ROUTES.manageHouse}
      sections={HOUSE_SECTIONS}
      renderSection={(section) => <HouseSection section={section} data={data} />}
    />
  );
}

export function OrganisationSettings({
  data,
  path,
  canEdit = CAN_EDIT_ORGANISATION_DETAILS,
}: {
  data: HouseData;
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
