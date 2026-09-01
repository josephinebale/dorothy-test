import { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Navigation,
  SquareCheck,
  Users,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { LocationMarker } from '../components/LocationMarker';
import { PinnedQuestion } from '../components/PinnedQuestion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import { Tag } from '../components/ui/Tag';
import { LOCATIONS, type Booking, type LocationData } from '../data/locations';
import { formatTime } from '../lib/date';
import { workerProfilePath } from '../lib/pageContent';
import { href, navigate } from '../lib/router';

type Step = 1 | 2 | 3;
type Frequency = 'one-off' | 'weekly' | 'fortnightly';
type Driving = 'not-required' | 'worker-vehicle' | 'location-vehicle';

type Draft = {
  date: string;
  startTime: string;
  endTime: string;
  frequency: Frequency;
  description: string;
  supportPlansConfirmed: boolean;
  driving: Driving;
  financeReference: string;
  selectedWorkerIds: string[];
};

/* Placeholder detail for the richer worker list, deterministic by roster index so
   a worker keeps the same suburb and training between reloads. */
const WORKER_SUBURBS = [
  'Camperdown',
  'Greenwich',
  'Artarmon',
  'Oatley',
  'Manly',
  'Marrickville',
  'Chatswood',
  'Balmain',
];

const WORKER_TRAINING = [
  [
    'insights into behaviour',
    'health and medication',
    'specialised daily supports',
    'positive behaviour support',
  ],
  [
    'catheter care',
    'tube feeding support',
    'diabetes management',
    'epilepsy and seizure support',
    'medication management',
  ],
  [],
  ['health and medication', 'insights into behaviour', 'complex bowel care', 'wound care'],
  ['positive behaviour support', 'insights into behaviour'],
];

function workerDetailFor(index: number): { suburb: string; training: string[] } {
  return {
    suburb: WORKER_SUBURBS[index % WORKER_SUBURBS.length],
    training: WORKER_TRAINING[index % WORKER_TRAINING.length],
  };
}

const HOURLY_RATE = 72.74;
const FIELD_CLASS =
  'mt-1 h-10 w-full rounded border border-border bg-surface px-3 text-sm text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: 'Location, date and time' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Select workers' },
];

function parseDateTime(date: string, time: string): Date | null {
  if (!date || !time) return null;
  const value = new Date(`${date}T${time}:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}

function durationHours(draft: Draft): number {
  const start = parseDateTime(draft.date, draft.startTime);
  const end = parseDateTime(draft.date, draft.endTime);
  if (!start || !end || end <= start) return 0;
  return (end.getTime() - start.getTime()) / 36e5;
}

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

function longDate(dateValue: string): string {
  if (!dateValue) return 'Not selected';
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${dateValue}T12:00:00`));
}

function displayTime(value: string): string {
  const date = parseDateTime('2026-01-01', value);
  return date ? formatTime(date) : '—';
}

function BookingRequestSummary({
  draft,
  step,
  locationName,
}: {
  draft: Draft;
  step: Step;
  locationName: string;
}) {
  const hours = durationHours(draft);
  const estimate = hours * HOURLY_RATE;

  return (
    <Card as="aside" className="sticky top-8 p-5">
      <h2 className="text-md font-bold text-text">Summary</h2>
      <ol className="mt-4 space-y-4">
        {STEPS.map((item) => {
          const completed = item.id < step;
          return (
            <li key={item.id} className="flex items-start gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                  completed
                    ? 'bg-info-surface text-brand'
                    : item.id === step
                      ? 'bg-surface-selected text-text'
                      : 'bg-surface-subtle text-text-secondary'
                }`}
              >
                {completed ? <Check className="h-5 w-5" /> : item.id}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-text">{item.label}</p>
                {item.id === 1 && draft.date && (
                  <p className="mt-1 text-xs text-text-secondary">
                    {locationName}
                    <br />
                    {longDate(draft.date)}, {displayTime(draft.startTime)}–{displayTime(draft.endTime)}
                  </p>
                )}
                {item.id === 2 && completed && (
                  <p className="mt-1 text-xs text-text-secondary">
                    {draft.driving === 'not-required'
                      ? 'No driving required'
                      : 'Driving required'}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 border-t border-border-subtle pt-4">
        <h3 className="text-sm font-bold text-text">Pricing estimate</h3>
        {hours > 0 ? (
          <>
            <div className="mt-3 flex justify-between gap-4 text-sm text-text-strong">
              <span>
                {hours} {hours === 1 ? 'hour' : 'hours'} at {money(HOURLY_RATE)} per hour
              </span>
              <span>{money(estimate)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border-subtle pt-3 text-sm font-bold text-text">
              <span>Total</span>
              <span>{money(estimate)}</span>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-text-secondary">
            Select a date and valid time range to see an estimate.
          </p>
        )}
      </div>
    </Card>
  );
}

function StepOne({
  draft,
  setDraft,
  data,
  showErrors,
  onSelectLocation,
}: {
  draft: Draft;
  setDraft: (next: Draft) => void;
  data: LocationData;
  showErrors: boolean;
  onSelectLocation: (locationId: string) => void;
}) {
  const invalidTime = durationHours(draft) <= 0;

  return (
    <div className="space-y-4">
      <Card as="section" className="relative p-5">
        <PinnedQuestion
          questionId="request-location"
          className="absolute top-4 right-4"
        />
        <p className="text-sm text-text-secondary">Step 1 of 3</p>
        <h2 className="mt-1 text-lg font-bold text-text">Location</h2>
        <div className="mt-4 flex items-center gap-3">
          <LocationMarker location={data.location} />
          <span className="relative min-w-0 flex-1">
            <select
              aria-label="Location"
              value={data.location.id}
              onChange={(event) => {
                onSelectLocation(event.target.value);
                setDraft({ ...draft, selectedWorkerIds: [] });
              }}
              className="h-10 w-full appearance-none rounded border border-border bg-surface px-3 pr-10 text-sm text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {LOCATIONS.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} — {location.suburb}, {location.state}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
          </span>
        </div>
      </Card>

      <Card as="section" className="p-5">
        <h2 className="text-lg font-bold text-text">Date and time</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium text-text">
            Date
            <input
              type="date"
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
              className={FIELD_CLASS}
              aria-invalid={showErrors && draft.date === ''}
            />
          </label>
          <label className="block text-sm font-medium text-text">
            Start time
            <input
              type="time"
              value={draft.startTime}
              onChange={(event) => setDraft({ ...draft, startTime: event.target.value })}
              className={FIELD_CLASS}
            />
          </label>
          <label className="block text-sm font-medium text-text">
            End time
            <input
              type="time"
              value={draft.endTime}
              onChange={(event) => setDraft({ ...draft, endTime: event.target.value })}
              className={FIELD_CLASS}
            />
          </label>
        </div>
        {showErrors && (draft.date === '' || invalidTime) && (
          <p role="alert" className="mt-2 text-sm text-badge">
            {draft.date === '' ? 'Select a booking date.' : 'End time must be after start time.'}
          </p>
        )}
        {durationHours(draft) > 0 && (
          <p className="mt-3 text-sm text-text-secondary">
            Booking duration: {durationHours(draft)} hours
          </p>
        )}

        <fieldset className="relative mt-5">
          <PinnedQuestion
            questionId="request-frequency"
            className="absolute -top-1 right-0"
          />
          <legend className="text-sm font-bold text-text">How often is this booking?</legend>
          <div className="mt-2 divide-y divide-border-subtle rounded border border-border-subtle">
            {([
              ['one-off', 'One-off'],
              ['weekly', 'Weekly'],
              ['fortnightly', 'Fortnightly'],
            ] as const).map(([value, label]) => (
              <label key={value} className="flex items-center gap-3 px-4 py-3 text-sm text-text">
                <input
                  type="radio"
                  name="frequency"
                  value={value}
                  checked={draft.frequency === value}
                  onChange={() => setDraft({ ...draft, frequency: value })}
                  className="h-4 w-4"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>
    </div>
  );
}

function StepTwo({
  draft,
  setDraft,
  showErrors,
}: {
  draft: Draft;
  setDraft: (next: Draft) => void;
  showErrors: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card as="section" className="p-5">
        <p className="text-sm text-text-secondary">Step 2 of 3</p>
        <h2 className="mt-1 text-lg font-bold text-text">Details</h2>
        <label className="mt-4 block text-sm font-medium text-text">
          What support is required during this booking?
          <textarea
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            placeholder="For example, personal care, preparing dinner, and an evening walk."
            rows={5}
            className="mt-1 w-full resize-y rounded border border-border bg-surface p-3 text-sm text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            aria-invalid={showErrors && draft.description.trim() === ''}
          />
        </label>
        {showErrors && draft.description.trim() === '' && (
          <p role="alert" className="mt-2 text-sm text-badge">Describe the support required.</p>
        )}
        <label className="mt-4 flex items-start gap-3 rounded bg-surface-selected p-4 text-sm text-text">
          <input
            type="checkbox"
            checked={draft.supportPlansConfirmed}
            onChange={(event) => setDraft({ ...draft, supportPlansConfirmed: event.target.checked })}
            className="mt-0.5 h-4 w-4 shrink-0"
          />
          I’ll share all relevant support plans with the worker who accepts this booking.
        </label>
        {showErrors && !draft.supportPlansConfirmed && (
          <p role="alert" className="mt-2 text-sm text-badge">
            Confirm that relevant support plans will be shared.
          </p>
        )}
      </Card>

      <Card as="section" className="p-5">
        <fieldset>
          <legend className="text-sm font-bold text-text">
            Will the support worker need to drive during this booking?
          </legend>
          <div className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle">
            {([
              ['not-required', 'No, driving is not required'],
              ['location-vehicle', 'Yes, the worker will drive our vehicle'],
              ['worker-vehicle', 'Yes, the worker will drive their own vehicle'],
            ] as const).map(([value, label]) => (
              <label key={value} className="flex items-center gap-3 px-4 py-3 text-sm text-text">
                <input
                  type="radio"
                  name="driving"
                  value={value}
                  checked={draft.driving === value}
                  onChange={() => setDraft({ ...draft, driving: value })}
                  className="h-4 w-4"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card as="section" className="p-5">
        <label className="block text-sm font-medium text-text">
          Finance reference <span className="font-normal text-text-secondary">(optional)</span>
          <input
            value={draft.financeReference}
            maxLength={200}
            onChange={(event) => setDraft({ ...draft, financeReference: event.target.value })}
            className={FIELD_CLASS}
          />
        </label>
        <p className="mt-2 text-xs text-text-secondary">
          Use a client name, location address, or purchase order number. This is for your records only.
        </p>
      </Card>
    </div>
  );
}

function StepThree({
  draft,
  setDraft,
  data,
  showErrors,
  workerDetail,
}: {
  draft: Draft;
  setDraft: (next: Draft) => void;
  data: LocationData;
  showErrors: boolean;
  workerDetail: boolean;
}) {
  const workers = useMemo(
    () => [...data.workers].sort((a, b) => a.name.localeCompare(b.name)),
    [data.workers],
  );

  const selectedNames = workers
    .filter((worker) => draft.selectedWorkerIds.includes(worker.id))
    .map((worker) => worker.name);

  const toggleWorker = (workerId: string) => {
    const selected = draft.selectedWorkerIds.includes(workerId);
    if (!selected && draft.selectedWorkerIds.length >= 10) return;
    setDraft({
      ...draft,
      selectedWorkerIds: selected
        ? draft.selectedWorkerIds.filter((id) => id !== workerId)
        : [...draft.selectedWorkerIds, workerId],
    });
  };

  return (
    <Card as="section" className="relative p-5">
      <PinnedQuestion
        questionId="request-workers"
        className="absolute top-4 right-4"
      />
      <p className="text-sm text-text-secondary">Step 3 of 3</p>
      <h2 className="mt-1 text-lg font-bold text-text">Select workers</h2>
      <p className="mt-2 text-sm text-text-secondary">
        {workerDetail
          ? 'Select up to 10 workers.'
          : `Send this request to up to 10 workers in the ${data.location.name} team.`}
      </p>
      <p className="mt-4 text-sm font-bold text-text">
        {workerDetail
          ? selectedNames.length === 0
            ? 'No workers selected'
            : `${selectedNames.length} worker${selectedNames.length === 1 ? '' : 's'} selected: ${selectedNames.join(', ')}`
          : `${draft.selectedWorkerIds.length} of 10 workers selected`}
      </p>

      {workers.length === 0 ? (
        <div className="mt-4 rounded border border-border-subtle px-4 py-8 text-center">
          <p className="font-bold text-text">No team members are available</p>
          <p className="mt-1 text-sm text-text-secondary">
            Add workers to this location before requesting a booking.
          </p>
        </div>
      ) : workerDetail ? (
        <ul className="mt-3 divide-y divide-border-subtle">
          {workers.map((worker, index) => {
            const unavailable = index === 5;
            const selected = draft.selectedWorkerIds.includes(worker.id);
            const atLimit = !selected && draft.selectedWorkerIds.length >= 10;
            const detail = workerDetailFor(index);
            return (
              <li key={worker.id} className="flex items-start gap-3 py-4">
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={unavailable || atLimit}
                  onChange={() => toggleWorker(worker.id)}
                  aria-label={worker.name}
                  className="mt-6 h-4 w-4 shrink-0"
                />
                <Avatar name={worker.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-text">{worker.name}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
                    <Navigation className="h-5 w-5 shrink-0" />
                    Based in {detail.suburb}, over 10km away
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
                    <SquareCheck className="h-5 w-5 shrink-0" />
                    {data.location.name} team
                  </p>
                  {detail.training.length > 0 && (
                    <p className="mt-1 flex items-start gap-2 text-xs text-text-secondary">
                      <Check className="h-5 w-5 shrink-0" />
                      <span>Trained in {detail.training.join(', ')}</span>
                    </p>
                  )}
                </div>
                {unavailable && <Tag tone="neutral">Booked at this time</Tag>}
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="mt-3 divide-y divide-border-subtle">
          {workers.map((worker, index) => {
            const unavailable = index === 5;
            const selected = draft.selectedWorkerIds.includes(worker.id);
            const atLimit = !selected && draft.selectedWorkerIds.length >= 10;
            return (
              <li key={worker.id}>
                <label
                  className={`flex items-center gap-3 py-3 ${
                    unavailable ? 'cursor-not-allowed text-text-secondary' : 'cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={unavailable || atLimit}
                    onChange={() => toggleWorker(worker.id)}
                    className="h-4 w-4 shrink-0"
                  />
                  <Avatar name={worker.name} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-text">
                      {worker.name}
                    </span>
                    <span className="block text-xs text-text-secondary">
                      {worker.planConfirmed ? 'Support plan confirmed' : 'Support plan needs review'}
                    </span>
                  </span>
                  {unavailable && (
                    <Tag tone="neutral">Booked at this time</Tag>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      )}
      {showErrors && draft.selectedWorkerIds.length === 0 && (
        <p role="alert" className="mt-3 text-sm text-badge">
          Select at least one worker to send the request.
        </p>
      )}
    </Card>
  );
}

function StatusSteps() {
  const steps = [
    'Booking was requested',
    'Worker to accept request',
    'Worker to submit their hours and shift notes',
    'Location manager to review and approve booking',
    'Payment to be processed',
  ];

  return (
    <Card as="aside" className="p-5">
      <h2 className="text-md font-bold text-text">Booking status</h2>
      <ol className="mt-4 space-y-4">
        {steps.map((label, index) => (
          <li key={label} className="flex items-start gap-3">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
              index === 0 ? 'bg-info-surface text-brand' : 'bg-surface-selected text-text-secondary'
            }`}>
              {index === 0 ? <Check className="h-5 w-5" /> : index + 1}
            </span>
            <span className={`text-sm ${index === 0 ? 'font-bold text-text' : 'text-text-strong'}`}>
              {label}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function BookingRequestDetail({
  booking,
  draft,
  data,
}: {
  booking: Booking | null;
  draft: Draft;
  data: LocationData;
}) {
  const draftStart = parseDateTime(draft.date, draft.startTime);
  const draftEnd = parseDateTime(draft.date, draft.endTime);
  const start = booking?.start ?? draftStart ?? new Date();
  const end = booking?.end ?? draftEnd ?? new Date(start.getTime() + 2 * 36e5);
  const hours = Math.max(0, (end.getTime() - start.getTime()) / 36e5);
  const estimate = hours * HOURLY_RATE;
  const requestedWorkerNames = booking?.requestedWorkerNames ?? (
    booking ? [booking.workerName] : []
  );
  const selectedWorkers = booking
    ? data.workers.filter((worker) => requestedWorkerNames.includes(worker.name))
    : data.workers.filter((worker) => draft.selectedWorkerIds.includes(worker.id));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="min-w-0">
        <a href={href('/bookings')} className="text-sm text-brand underline hover:text-brand-hover">
          Back to bookings
        </a>
        <h1 className="mt-4 text-xl font-bold text-text">Requested booking</h1>
        <p className="mt-3 text-lg font-bold text-text">
          {longDate(`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`)}, {formatTime(start)}–{formatTime(end)}
        </p>
        <p className="mt-1 text-sm text-text-secondary">Times shown in the location’s local time.</p>

        <dl className="mt-5 space-y-2 text-sm text-text-strong">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5" />
            <span>{hours} {hours === 1 ? 'hour' : 'hours'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span>{booking?.address || `${data.location.name}, ${data.location.suburb} ${data.location.state}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>{(booking?.driving ?? draft.driving) === 'not-required' ? 'No driving required' : 'Driving required'}</span>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" variant="secondary">Edit</Button>
          <Button type="button" variant="secondary">Cancel request</Button>
          <Button href={href('/request-booking')} variant="secondary">Duplicate</Button>
        </div>

        <div className="mt-6">
          <h2 className="text-md font-bold text-text">Support details</h2>
          <p className="mt-2 text-sm text-text-strong">
            {booking?.description || draft.description || 'Support with daily routines and activities at this location.'}
          </p>
          {(booking?.financeReference || draft.financeReference) && (
            <p className="mt-3 text-sm text-text-secondary">
              Finance reference: {booking?.financeReference || draft.financeReference}
            </p>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-md font-bold text-text">Support workers</h2>
          <Card tone="subtle" className="mt-3 p-4">
            <p className="text-sm font-bold text-text">
              Sent to {selectedWorkers.length || 1} {selectedWorkers.length === 1 ? 'worker' : 'workers'} in your team
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Waiting for a worker to accept this booking request.
            </p>
            <div className="mt-4 space-y-3">
              {(selectedWorkers.length > 0
                ? selectedWorkers
                : data.workers.slice(0, 1)
              ).map((worker) => (
                <div key={worker.id} className="flex items-center gap-3">
                  <Avatar name={worker.name} size="md" />
                  <EntityLink href={href(workerProfilePath(worker.id))}>
                    {worker.name}
                  </EntityLink>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <h2 className="text-md font-bold text-text">Pricing estimate</h2>
          <Card className="mt-3 p-4">
            <div className="flex justify-between gap-4 text-sm text-text-strong">
              <span>{hours} {hours === 1 ? 'hour' : 'hours'} at {money(HOURLY_RATE)} per hour</span>
              <span>{money(estimate)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border-subtle pt-3 text-sm font-bold text-text">
              <span>Total</span>
              <span>{money(estimate)}</span>
            </div>
          </Card>
        </div>
      </section>
      <StatusSteps />
    </div>
  );
}

export function BookingRequest({
  path,
  data,
  onCreateBooking,
  onSelectLocation,
  workerDetail,
}: {
  path: string;
  data: LocationData;
  onCreateBooking: (booking: Booking) => void;
  onSelectLocation: (locationId: string) => void;
  workerDetail: boolean;
}) {
  const [step, setStep] = useState<Step>(1);
  const [showErrors, setShowErrors] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    date: '',
    startTime: '09:00',
    endTime: '11:00',
    frequency: 'one-off',
    description: '',
    supportPlansConfirmed: false,
    driving: 'not-required',
    financeReference: '',
    selectedWorkerIds: [],
  });

  const requestId = path.startsWith('/bookings/request/')
    ? path.slice('/bookings/request/'.length)
    : null;
  const existingBooking = requestId && requestId !== 'new-request'
    ? data.bookings.find((booking) => booking.id === requestId) ?? null
    : null;

  if (requestId) {
    return <BookingRequestDetail booking={existingBooking} draft={draft} data={data} />;
  }

  const firstStepValid = draft.date !== '' && durationHours(draft) > 0;
  const secondStepValid =
    draft.description.trim() !== '' && draft.supportPlansConfirmed;
  const thirdStepValid = draft.selectedWorkerIds.length > 0;
  const valid = step === 1 ? firstStepValid : step === 2 ? secondStepValid : thirdStepValid;

  const continueFlow = () => {
    if (!valid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (step < 3) {
      setStep((step + 1) as Step);
      window.scrollTo(0, 0);
      return;
    }
    const start = parseDateTime(draft.date, draft.startTime);
    const end = parseDateTime(draft.date, draft.endTime);
    if (!start || !end) return;
    const requestedWorkerNames = data.workers
      .filter((worker) => draft.selectedWorkerIds.includes(worker.id))
      .map((worker) => worker.name);
    const newBooking: Booking = {
      id: `${data.location.id}-request-${Date.now()}`,
      locationId: data.location.id,
      workerName: requestedWorkerNames[0],
      requestedWorkerNames,
      start,
      end,
      status: 'requested',
      sleepover: false,
      createdByMe: true,
      address: `${data.location.name}, ${data.location.suburb} ${data.location.state}`,
      description: draft.description,
      driving: draft.driving,
      financeReference: draft.financeReference,
      frequency: draft.frequency,
    };
    onCreateBooking(newBooking);
    navigate(`/bookings/request/${newBooking.id}`);
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-text">Request a booking</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Add the location, date and time, details, and workers.
      </p>
      {step > 1 && (
        <button
          type="button"
          onClick={() => {
            setStep((step - 1) as Step);
            setShowErrors(false);
          }}
          className="mt-3 text-sm text-brand underline hover:text-brand-hover"
        >
          ← Back to {step === 2 ? 'location, date and time' : 'details'}
        </button>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          {step === 1 && (
            <StepOne
              draft={draft}
              setDraft={setDraft}
              data={data}
              showErrors={showErrors}
              onSelectLocation={onSelectLocation}
            />
          )}
          {step === 2 && (
            <StepTwo draft={draft} setDraft={setDraft} showErrors={showErrors} />
          )}
          {step === 3 && (
            <StepThree
              draft={draft}
              setDraft={setDraft}
              data={data}
              showErrors={showErrors}
              workerDetail={workerDetail}
            />
          )}
          {step < 3 && (
            <p className="mt-5 text-sm text-text-strong">
              Next step: {step === 1 ? 'Details' : 'Select workers'}
            </p>
          )}
          <div className={`flex items-center gap-3 ${step < 3 ? 'mt-3' : 'mt-5'}`}>
            <Button type="button" variant="primary" onClick={continueFlow}>
              {step === 3 ? 'Submit booking request' : 'Continue'}
            </Button>
            <Button href={href('/bookings')} variant="ghost">Cancel</Button>
          </div>
        </div>
        <BookingRequestSummary
          draft={draft}
          step={step}
          locationName={data.location.name}
        />
      </div>
    </div>
  );
}
