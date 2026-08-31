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
        <h2 className="text-md font-bold text-text">Most booked</h2>
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
            <li key={worker.id} className="ui-target-row p-3">
              <div className="flex items-center gap-2">
                <Avatar name={worker.name} size="sm" />
                <EntityLink
                  href={href(TEAM_ROUTE)}
                  className="ui-target-row__link min-w-0 truncate"
                >
                  {worker.name}
                </EntityLink>
              </div>

              {/* Aligned to the row's content edge, not the name, so each row has one left edge. */}
              <div className="ui-target-row__action mt-1 flex items-center gap-2">
                <Button
                  href={href('/messages')}
                  variant="secondary"
                  size="small"
                  className="whitespace-nowrap"
                  aria-label={`Message ${worker.name}`}
                >
                  Message
                </Button>
                <Button
                  href={href('/request-booking')}
                  variant="secondary"
                  size="small"
                  className="whitespace-nowrap"
                  aria-label={`Book ${worker.name}`}
                >
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
