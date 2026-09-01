import type { LocationData } from '../data/locations';
import { PageHeading, RequestBookingButton } from '../components/PageHeading';
import { Button } from '../components/ui/Button';
import { href } from '../lib/router';
import { BookingsWeek } from './dashboard/BookingsWeek';
import { NotificationStrip } from './dashboard/NotificationStrip';
import { TeamPanel } from './dashboard/TeamPanel';

export function Dashboard({ data }: { data: LocationData }) {
  return (
    <div className="layout-content-aside flex items-baseline gap-6">
      <div className="min-w-0 flex-1">
        <PageHeading
          title="Dashboard"
          actions={
            <>
              <RequestBookingButton />
              <Button href={href('/report-incident')}>Report incident</Button>
            </>
          }
        />
        <div className="space-y-6">
          <NotificationStrip data={data} />
          <BookingsWeek data={data} />
        </div>
      </div>

      <aside className="shrink-0">
        <TeamPanel data={data} />
      </aside>
    </div>
  );
}
