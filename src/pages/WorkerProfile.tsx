import { CheckCircle2 } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { PageHeading } from '../components/PageHeading';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import { findWorker, type LocationData } from '../data/locations';
import { TEAM_ROUTE } from '../lib/pageContent';
import { href } from '../lib/router';

const SUPPORT_AREAS = [
  'Personal care',
  'Community access',
  'Domestic assistance',
  'Transport',
  'Social and recreational support',
];

const QUALIFICATIONS = [
  'Certificate III in Individual Support',
  'First aid and CPR',
  'Medication assistance',
];

const AVAILABILITY = [
  ['Monday', 'Morning', 'Afternoon'],
  ['Tuesday', 'Afternoon'],
  ['Wednesday', 'Morning', 'Evening'],
  ['Thursday', 'Afternoon', 'Evening'],
  ['Friday', 'Morning'],
  ['Saturday', 'Sleepover'],
];

export function WorkerProfile({
  data,
  workerId,
}: {
  data: LocationData;
  workerId: string | null;
}) {
  const localIndex = data.workers.findIndex((item) => item.id === workerId);
  const found =
    localIndex >= 0
      ? { worker: data.workers[localIndex], location: data.location, index: localIndex }
      : findWorker(workerId);
  const worker = found?.worker;
  const workerIndex = found?.index ?? 0;

  if (!worker || !found) {
    return (
      <div className="width-main-column">
        <PageHeading title="Worker profile" />
        <Card className="px-6 py-12 text-center">
          <p className="text-lg font-bold text-text">Worker not found</p>
          <p className="mt-1 text-sm text-text-secondary">
            This worker is not on the team at any of your locations.
          </p>
          <Button href={href(TEAM_ROUTE)} variant="secondary" className="mt-4">
            Back to team
          </Button>
        </Card>
      </div>
    );
  }

  const completedBookings = Math.max(worker.bookingCount, 8 + workerIndex * 3);
  const yearsExperience = 3 + (workerIndex % 6);

  return (
    <div>
      <a
        href={href(TEAM_ROUTE)}
        className="mb-4 inline-block rounded text-sm text-brand underline hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Back to team
      </a>

      <PageHeading
        title={worker.name}
        description={`Support worker on the ${found.location.name} team`}
        actions={
          <>
            <Button href={href('/messages')} variant="secondary">
              Message
            </Button>
            <Button href={href('/request-booking')}>Request booking</Button>
          </>
        }
      />

      <div className="layout-rail-content grid gap-6">
        <aside>
          <Card className="p-6 text-center">
            <div className="flex justify-center">
              <Avatar name={worker.name} size="lg" />
            </div>
            <p className="mt-3 text-md font-bold text-text">{worker.name}</p>
            <p className="mt-1 text-sm text-text-secondary">Support worker</p>
            <p className="mt-1 text-xs text-text-tertiary">{found.location.name}</p>
            <p className="mt-4 text-sm text-text">
              {completedBookings} bookings with {found.location.name}
            </p>
            <div className="mt-4 border-t border-border-subtle pt-4 text-left">
              <p className="flex items-center gap-2 text-sm text-text">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Identity verified
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-text">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Worker screening verified
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-text">
                <CheckCircle2 className="h-5 w-5 text-success" />
                {worker.planConfirmed ? 'Support plan confirmed' : 'Support plan needs review'}
              </p>
            </div>
          </Card>
        </aside>

        <div className="min-w-0 space-y-6">
          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">About</h2>
            <p className="mt-3 text-sm text-text-strong">
              I’m a disability support worker with {yearsExperience} years of experience supporting
              people at home and in the community. I enjoy building steady routines, helping people
              stay connected, and working closely with each location’s wider support team.
            </p>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">Availability</h2>
            <div className="mt-3 space-y-3">
              {AVAILABILITY.map(([day, ...times]) => (
                <div key={day} className="flex items-start gap-4">
                  <p className="w-24 shrink-0 text-sm font-medium text-text">{day}</p>
                  <div className="flex flex-wrap gap-2">
                    {times.map((time) => <Tag key={time}>{time}</Tag>)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">Support offered</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
              {SUPPORT_AREAS.map((area) => (
                <li key={area} className="flex items-center gap-2 text-sm text-text">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  {area}
                </li>
              ))}
            </ul>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">Verified documents</h2>
            <ul className="mt-3 divide-y divide-border-subtle">
              {['NDIS Worker Screening Check', 'Working with Children Check', 'First aid certificate'].map((document) => (
                <li key={document} className="flex items-center gap-2 py-3 first:pt-0 last:pb-0">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  <span className="text-sm text-text">{document}</span>
                  <span className="ml-auto text-xs text-text-secondary">Verified</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">Qualifications</h2>
            <ul className="mt-3 space-y-3">
              {QUALIFICATIONS.map((qualification, index) => (
                <li key={qualification}>
                  <p className="text-sm font-medium text-text">{qualification}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Completed {2021 + index} · Self declared
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <Card as="section" className="p-6">
            <h2 className="text-md font-bold text-text">Work history</h2>
            <div className="mt-3 space-y-4">
              <div>
                <p className="text-sm font-medium text-text">Disability Support Worker</p>
                <p className="mt-1 text-sm text-text-secondary">Community support provider</p>
                <p className="mt-1 text-xs text-text-secondary">2022 – Present</p>
              </div>
              <div>
                <p className="text-sm font-medium text-text">Support Worker</p>
                <p className="mt-1 text-sm text-text-secondary">Independent support work</p>
                <p className="mt-1 text-xs text-text-secondary">2019 – 2022</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
