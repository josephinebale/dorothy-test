import { Calendar, MessageCircle } from 'lucide-react';
import type { HouseData } from '../../data/houses';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EntityLink } from '../../components/ui/EntityLink';
import { EMPTY_STATES, TEAM_ROUTE } from '../../lib/pageContent';
import { href } from '../../lib/router';

export function TeamPanel({ data }: { data: HouseData }) {
  const workers = data.workers.slice(0, 10);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-md font-bold text-text">Most booked workers</h2>
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
            <li key={worker.id} className="ui-target-row p-3">
              <div className="flex items-center gap-3">
                <Avatar name={worker.name} size="md" />
                <EntityLink
                  href={href(TEAM_ROUTE)}
                  className="ui-target-row__link ui-target-row__link--text min-w-0 flex-1 truncate"
                >
                  {worker.name}
                </EntityLink>
              </div>
              <div className="ui-target-row__action mt-3 flex items-center gap-2">
                <Button
                  href={href('/messages')}
                  variant="secondary"
                  size="small"
                  className="whitespace-nowrap"
                  aria-label={`Message ${worker.name}`}
                >
                  <MessageCircle className="h-5 w-5 shrink-0" />
                  Message
                </Button>
                <Button
                  href={href('/request-booking')}
                  variant="secondary"
                  size="small"
                  className="whitespace-nowrap"
                  aria-label={`Book ${worker.name}`}
                >
                  <Calendar className="h-5 w-5 shrink-0" />
                  Book
                </Button>
              </div>
            </li>
          ))}
        </Card>
      )}
    </div>
  );
}
