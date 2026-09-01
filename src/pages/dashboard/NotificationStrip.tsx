import { Briefcase, Calendar, CalendarCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { LocationData } from '../../data/locations';
import { NOTIFICATION_EMPTY_DESCRIPTIONS } from '../../lib/pageContent';
import { href } from '../../lib/router';
import { Card } from '../../components/ui/Card';

type StripCard = {
  title: string;
  description: string;
  Icon: LucideIcon;
  path?: string;
};

function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

function buildCards(data: LocationData): StripCard[] {
  const { requestsToAccept, bookingsToApprove } = data;

  return [
    {
      title:
        requestsToAccept > 0
          ? `${requestsToAccept} ${plural(requestsToAccept, 'request', 'requests')} waiting to be accepted`
          : 'No requests waiting to be accepted',
      description:
        requestsToAccept > 0
          ? 'Review and manage your booking requests.'
          : NOTIFICATION_EMPTY_DESCRIPTIONS.requests,
      Icon: Calendar,
      path: requestsToAccept > 0 ? '/bookings' : undefined,
    },
    {
      title:
        bookingsToApprove > 0
          ? `${bookingsToApprove} ${plural(bookingsToApprove, 'booking', 'bookings')} to approve`
          : 'No bookings to approve',
      description:
        bookingsToApprove > 0
          ? 'Approve the booking so that your support worker can be paid on time.'
          : NOTIFICATION_EMPTY_DESCRIPTIONS.approvals,
      Icon: CalendarCheck,
      path: bookingsToApprove > 0 ? '/bookings' : undefined,
    },
    {
      title: 'No new job applicants',
      description: NOTIFICATION_EMPTY_DESCRIPTIONS.applicants,
      Icon: Briefcase,
    },
  ];
}

export function NotificationStrip({ data }: { data: LocationData }) {
  const cards = buildCards(data);

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-md font-bold text-text">Notifications</h2>
        <a
          href={href('/notifications')}
          className="rounded text-sm text-brand underline hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          View all
        </a>
      </div>

      <Card className="grid grid-cols-3 divide-x divide-border-subtle">
        {cards.map(({ title, description, Icon, path }) => (
          <div
            key={title}
            className={`flex items-start justify-between gap-2 p-4 ${path ? 'ui-target-row' : ''}`}
          >
            <div className="min-w-0">
              {path ? (
                <a
                  href={href(path)}
                  className="ui-target-row__link ui-target-row__link--text block"
                >
                  {title}
                </a>
              ) : (
                <p className="text-sm font-bold text-text-strong">{title}</p>
              )}
              <p className="mt-1 text-sm text-text-secondary">{description}</p>
            </div>
            <Icon className="h-5 w-5 shrink-0 text-text-strong" />
          </div>
        ))}
      </Card>
    </section>
  );
}
