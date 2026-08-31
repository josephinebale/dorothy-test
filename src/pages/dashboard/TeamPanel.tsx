import { Calendar, MessageCircle } from 'lucide-react';
import type { HouseData } from '../../data/houses';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/ui/Card';
import { EntityLink } from '../../components/ui/EntityLink';
import { IconButton } from '../../components/ui/IconButton';
import { EMPTY_STATES, TEAM_ROUTE } from '../../lib/pageContent';
import { href } from '../../lib/router';

export function TeamPanel({ data }: { data: HouseData }) {
  const workers = data.workers.slice(0, 10);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-md font-bold text-text">Team</h2>
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
          <p className="mt-1 text-sm text-text-secondary">
            {EMPTY_STATES.dashboardTeam.description}
          </p>
        </Card>
      ) : (
        <Card as="ul" divided className="mt-3">
          {workers.map((worker) => (
            <li key={worker.id} className="ui-target-row flex gap-2 p-3">
              <Avatar name={worker.name} size="sm" />
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <EntityLink
                  href={href(TEAM_ROUTE)}
                  className="ui-target-row__link min-w-0 truncate"
                >
                  {worker.name}
                </EntityLink>
                <div className="ui-target-row__action flex shrink-0 items-center gap-1">
                  <IconButton
                    href={href('/messages')}
                    size="small"
                    aria-label={`Message ${worker.name}`}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </IconButton>
                  <IconButton
                    href={href('/request-booking')}
                    size="small"
                    aria-label={`Book ${worker.name}`}
                  >
                    <Calendar className="h-5 w-5" />
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </Card>
      )}
    </div>
  );
}
