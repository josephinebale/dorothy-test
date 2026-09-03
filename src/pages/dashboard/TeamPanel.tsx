import { Calendar, MessageSquare } from 'lucide-react';
import type { LocationData } from '../../data/locations';
import { Avatar } from '../../components/Avatar';
import { PinnedQuestion } from '../../components/PinnedQuestion';
import { Card } from '../../components/ui/Card';
import { EntityLink } from '../../components/ui/EntityLink';
import { IconButton } from '../../components/ui/IconButton';
import { EMPTY_STATES, TEAM_ROUTE, workerProfilePath } from '../../lib/pageContent';
import { href } from '../../lib/router';

export function TeamPanel({ data }: { data: LocationData }) {
  const workers = data.workers.slice(0, 10);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-md font-bold text-text">Most booked workers</h2>
          <PinnedQuestion questionId="dashboard-worker-order" />
        </div>
        <a
          href={href(TEAM_ROUTE)}
          className="rounded text-sm text-brand underline hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          View team
        </a>
      </div>

      {workers.length === 0 ? (
        <Card className="mt-3 p-4">
          <p className="text-lg font-bold text-text">
            {EMPTY_STATES.dashboardTeam.title}
          </p>
          <p className="mt-1 max-w-content text-sm text-text-secondary">
            {EMPTY_STATES.dashboardTeam.description}
          </p>
        </Card>
      ) : (
        <Card as="ul" divided className="mt-3">
          {workers.map((worker) => (
            <li
              key={worker.id}
              className="ui-inset-row ui-target-row flex items-center gap-3"
            >
              <Avatar name={worker.name} size="md" />
              <EntityLink
                href={href(workerProfilePath(worker.id))}
                className="ui-target-row__link ui-target-row__link--text min-w-0 flex-1 truncate"
              >
                {worker.name}
              </EntityLink>
              <div className="ui-target-row__action ml-auto flex shrink-0 items-center gap-1">
                <IconButton
                  href={href('/messages')}
                  aria-label={`Message ${worker.name}`}
                  data-tooltip={`Message ${worker.name}`}
                  className="ui-tooltip"
                >
                  <MessageSquare className="h-5 w-5" />
                </IconButton>
                <IconButton
                  href={href('/request-booking')}
                  aria-label={`Book ${worker.name}`}
                  data-tooltip={`Book ${worker.name}`}
                  className="ui-tooltip"
                >
                  <Calendar className="h-5 w-5" />
                </IconButton>
              </div>
            </li>
          ))}
        </Card>
      )}
    </div>
  );
}
