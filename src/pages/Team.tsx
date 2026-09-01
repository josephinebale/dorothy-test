import { MoreHorizontal } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { PageHeading, RequestBookingButton } from '../components/PageHeading';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';
import { IconButton } from '../components/ui/IconButton';
import type { LocationData, Worker } from '../data/locations';
import { EMPTY_STATES, workerProfilePath } from '../lib/pageContent';
import { href } from '../lib/router';

function workerSummary(worker: Worker, index: number): string {
  const details = ['Paying at Level 1.'];

  if (index % 4 === 1) details.push('Vehicle allowance enabled.');
  details.push(
    worker.planConfirmed
      ? 'Latest support plan confirmed.'
      : 'Has not confirmed latest support plan.',
  );

  return details.join(' ');
}

export function Team({ data }: { data: LocationData }) {
  const workers = [...data.workers].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="width-main-column">
      <PageHeading
        title="Team"
        description="Manage the workers you book shifts with. They have access to your support plan so they can best provide the support you need."
        actions={<RequestBookingButton />}
      />

      {workers.length > 0 ? (
        <Card as="ul" divided>
          {workers.map((worker, index) => (
            <li key={worker.id} className="ui-target-row flex entity-row items-center gap-3 p-3">
              <Avatar name={worker.name} size="md" />
              <div className="min-w-0 flex-1">
                <EntityLink
                  href={href(workerProfilePath(worker.id))}
                  className="ui-target-row__link"
                >
                  {worker.name}
                </EntityLink>
                <p className="mt-1 text-sm text-text-secondary">
                  {workerSummary(worker, index)}
                </p>
              </div>
              <IconButton
                type="button"
                aria-label={`More options for ${worker.name}`}
                data-tooltip={`More options for ${worker.name}`}
                className="ui-target-row__action ui-tooltip"
              >
                <MoreHorizontal className="h-5 w-5" />
              </IconButton>
            </li>
          ))}
        </Card>
      ) : (
        <Card className="px-6 py-12 text-center">
          <p className="text-lg font-bold text-text">{EMPTY_STATES.team.title}</p>
          <p className="mt-1 max-w-content mx-auto text-sm text-text-secondary">
            {EMPTY_STATES.team.description}
          </p>
        </Card>
      )}
    </div>
  );
}
